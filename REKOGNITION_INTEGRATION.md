# Amazon Rekognition Integration

**Feature:** AI-Powered Media Tagging
**Status:** Implemented
**Date:** December 5, 2025

---

## Overview

SyncOps now uses **Amazon Rekognition** to automatically analyze and tag uploaded media files. When a user uploads an image or video frame to a project, the system:

1. Stores the file in S3
2. Triggers a Lambda function
3. Calls Rekognition to detect objects, scenes, and activities
4. Saves AI-generated tags to DynamoDB
5. Displays tags in real-time on the frontend

---

## Architecture Flow

```
User Uploads File
       ↓
Frontend creates Asset record (DynamoDB)
       ↓
Frontend uploads file to S3
       ↓
S3 triggers Lambda (mediaProcessor)
       ↓
Lambda updates Asset status to 'PROCESSING'
       ↓
Lambda calls Rekognition DetectLabels API
       ↓
Lambda extracts tags and confidence scores
       ↓
Lambda updates Asset with:
  - aiTags: ["Person", "Car", "Building", ...]
  - aiConfidence: 85.3 (average)
  - aiProcessedAt: timestamp
  - type: 'MASTER' (processing complete)
       ↓
Frontend displays tags in real-time (via observeQuery)
```

---

## Changes Made

### 1. Data Schema ([amplify/data/resource.ts](amplify/data/resource.ts))

Added three new fields to the `Asset` model:

```typescript
// AI/Rekognition metadata
aiTags: a.string().array(), // Labels detected (e.g., ["Person", "Car"])
aiConfidence: a.float(), // Average confidence score (0-100)
aiProcessedAt: a.datetime(), // When analysis completed
```

### 2. Lambda Function ([amplify/function/mediaProcessor/](amplify/function/mediaProcessor/))

**Dependencies:**
- Added `@aws-sdk/client-rekognition` (v3.943.0)

**Handler Updates ([handler.ts](amplify/function/mediaProcessor/handler.ts)):**
- Imported `RekognitionClient` and `DetectLabelsCommand`
- Initialized Rekognition client with AWS region
- Added logic to:
  - Call `DetectLabels` API with S3 object reference
  - Extract label names and confidence scores
  - Calculate average confidence
  - Update Asset record with AI metadata
  - Handle errors gracefully (e.g., unsupported file types)

**Configuration ([resource.ts](amplify/function/mediaProcessor/resource.ts)):**
- Increased timeout to 60 seconds (Rekognition can take time)

**Rekognition Parameters:**
- `MaxLabels`: 20 (return up to 20 labels)
- `MinConfidence`: 70 (only labels with 70%+ confidence)

### 3. IAM Permissions ([amplify/backend.ts](amplify/backend.ts))

Added two policy statements to Lambda role:

```typescript
// Rekognition permissions
{
  actions: [
    'rekognition:DetectLabels',
    'rekognition:DetectText',
    'rekognition:DetectModerationLabels',
  ],
  resources: ['*'],
}

// S3 read permissions for Rekognition
{
  actions: ['s3:GetObject'],
  resources: [backend.storage.resources.bucket.arnForObjects('*')],
}
```

### 4. Frontend ([app/projects/[id]/page.tsx](app/projects/[id]/page.tsx))

**Data Fetching:**
- Changed from S3 file listing to DynamoDB Asset query
- Implemented real-time updates using `observeQuery()`
- Assets update automatically when Lambda completes processing

**UI Components:**
- **Status Badge:**
  - RAW: Teal (uploaded, not yet processed)
  - PROCESSING: Yellow with pulse animation (Rekognition running)
  - MASTER: Green (processing complete)

- **Confidence Score:**
  - Displays average confidence percentage
  - Example: "85% confident"

- **AI Tags Section:**
  - Displays up to 5 tags with teal pill styling
  - Shows "+X more" if more than 5 tags
  - Hidden if no tags yet

- **Processing Indicator:**
  - Shows "🤖 AI analyzing..." during processing
  - Pulse animation for visual feedback

---

## Supported File Types

Rekognition supports:
- **Images:** JPEG, PNG
- **Video:** MP4, MOV, AVI (frame extraction required)

For unsupported files, Lambda logs a warning and skips AI tagging without failing.

---

## Example Rekognition Response

```json
{
  "Labels": [
    { "Name": "Person", "Confidence": 99.9 },
    { "Name": "Car", "Confidence": 95.2 },
    { "Name": "Urban", "Confidence": 88.7 },
    { "Name": "Street", "Confidence": 85.3 },
    { "Name": "Building", "Confidence": 82.1 }
  ]
}
```

**Processed Result:**
- `aiTags`: ["Person", "Car", "Urban", "Street", "Building"]
- `aiConfidence`: 90.24 (average of all confidence scores)

---

## CloudWatch Logs

Lambda outputs detailed logs for debugging:

```
Processing file: media/abc123/photo.jpg from bucket: syncOpsDrive
Asset [def456] marked as PROCESSING
Calling Rekognition for media/abc123/photo.jpg...
Rekognition detected 5 labels with avg confidence 90.24%
Tags: Person, Car, Urban, Street, Building
SUCCESS: Asset [def456] updated with AI tags
```

---

## Error Handling

### Unsupported File Types
If Rekognition cannot process a file:
- Lambda catches `InvalidImageFormatException` or `InvalidS3ObjectException`
- Logs warning: "Rekognition cannot process this file type. Skipping AI tagging."
- Continues without failing
- Asset remains in database without AI tags

### Missing Asset Record
If Asset not found in DynamoDB:
- Lambda logs error: "Asset record not found... may not have been created yet"
- Skips processing for that file
- (Frontend creates record BEFORE upload to prevent this)

---

## Performance Considerations

1. **Timeout:** Set to 60 seconds (Rekognition can take 10-30 seconds for large images)
2. **Confidence Threshold:** 70% minimum to filter out low-quality labels
3. **Max Labels:** Limited to 20 to avoid overwhelming UI
4. **Real-time Updates:** `observeQuery()` ensures UI updates immediately when Lambda finishes

---

## Cost Considerations

### Rekognition Pricing (us-east-1)
- **DetectLabels:** $0.001 per image
- **First 1M images/month:** $1.00 per 1,000 images
- **Over 1M images/month:** $0.80 per 1,000 images

### Example Costs
- 100 images/month: $0.10
- 1,000 images/month: $1.00
- 10,000 images/month: $10.00

### Other AWS Costs
- **Lambda:** First 1M requests free, then $0.20 per 1M
- **S3:** Storage + GET requests (minimal)
- **DynamoDB:** On-demand pricing (minimal for this use case)

---

## Future Enhancements

### Immediate
- [ ] Add file type validation before upload
- [ ] Display all tags in modal/tooltip (not just first 5)
- [ ] Add search/filter by AI tags

### Short-term
- [ ] Implement `DetectText` for OCR on documents
- [ ] Use `DetectModerationLabels` to flag inappropriate content
- [ ] Add celebrity recognition (`RecognizeCelebrities`)
- [ ] Support video analysis (extract frames + analyze)

### Long-term
- [ ] Custom Rekognition model training
- [ ] Face detection and matching
- [ ] Scene/activity timeline for videos
- [ ] Automatic content moderation workflow

---

## Testing

To test the integration:

1. **Start Sandbox:**
   ```bash
   npx ampx sandbox
   ```

2. **Upload an Image:**
   - Navigate to a project
   - Click upload zone
   - Select a JPEG or PNG image
   - Watch status change: RAW → PROCESSING → MASTER

3. **Verify in CloudWatch:**
   - AWS Console → CloudWatch → Log Groups
   - Find `/aws/lambda/mediaProcessor-*`
   - Check logs for Rekognition API calls

4. **Check DynamoDB:**
   - AWS Console → DynamoDB → Tables
   - Find `Asset-*` table
   - Verify `aiTags`, `aiConfidence`, `aiProcessedAt` fields

---

## Troubleshooting

### Tags Not Appearing
1. Check Lambda logs in CloudWatch
2. Verify IAM permissions are deployed
3. Confirm file is a supported type (JPEG/PNG)
4. Check Rekognition service quota limits

### "Invalid Image Format" Error
- File type not supported (e.g., GIF, TIFF)
- Solution: Convert to JPEG or PNG before upload

### Timeout Errors
- Image too large (>15MB recommended max)
- Increase Lambda timeout beyond 60 seconds
- Or resize images before upload

---

## Resources

- [AWS Rekognition Documentation](https://docs.aws.amazon.com/rekognition/)
- [DetectLabels API Reference](https://docs.aws.amazon.com/rekognition/latest/APIReference/API_DetectLabels.html)
- [Rekognition Pricing](https://aws.amazon.com/rekognition/pricing/)
- [Amplify Gen2 Lambda Guide](https://docs.amplify.aws/nextjs/build-a-backend/functions/)

---

*Integration completed: December 5, 2025*
