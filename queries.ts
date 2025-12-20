/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const analyzeProjectBrief = /* GraphQL */ `query AnalyzeProjectBrief(
  $projectDescription: String!
  $scriptOrNotes: String
) {
  analyzeProjectBrief(
    projectDescription: $projectDescription
    scriptOrNotes: $scriptOrNotes
  )
}
` as GeneratedQuery<
  APITypes.AnalyzeProjectBriefQueryVariables,
  APITypes.AnalyzeProjectBriefQuery
>;
export const getAIAnalysisJob = /* GraphQL */ `query GetAIAnalysisJob($id: ID!) {
  getAIAnalysisJob(id: $id) {
    analysisType
    asset {
      aiConfidence
      aiProcessedAt
      aiTags
      approvalRequirements
      approvalState
      clientApprovalNote
      clientApproved
      clientApprovedAt
      clientApprovedBy
      createdAt
      dimensions
      duration
      fileSize
      finalApprovedAt
      finalApprovedBy
      id
      internalApprovalNote
      internalApproved
      internalApprovedAt
      internalApprovedBy
      isBRoll
      isLegalLocked
      isPlannedShot
      legalApprovalNote
      legalApproved
      legalApprovedAt
      legalApprovedBy
      legalLockedAt
      mimeType
      organizationId
      owner
      projectId
      s3Key
      shotDescription
      shotListItemId
      storageClass
      thumbnailKey
      type
      updatedAt
      usageHeatmap
      version
      __typename
    }
    assetId
    assetName
    assetVersionId
    assetVersionNumber
    completedAt
    createdAt
    errorMessage
    id
    organizationId
    progress
    projectId
    queuedAt
    rekognitionJobId
    resultsCount
    resultsSnapshot
    s3KeyAtAnalysis
    startedAt
    status
    transcribeJobName
    triggeredBy
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetAIAnalysisJobQueryVariables,
  APITypes.GetAIAnalysisJobQuery
>;
export const getAIFaceDetection = /* GraphQL */ `query GetAIFaceDetection($id: ID!) {
  getAIFaceDetection(id: $id) {
    ageRange
    asset {
      aiConfidence
      aiProcessedAt
      aiTags
      approvalRequirements
      approvalState
      clientApprovalNote
      clientApproved
      clientApprovedAt
      clientApprovedBy
      createdAt
      dimensions
      duration
      fileSize
      finalApprovedAt
      finalApprovedBy
      id
      internalApprovalNote
      internalApproved
      internalApprovedAt
      internalApprovedBy
      isBRoll
      isLegalLocked
      isPlannedShot
      legalApprovalNote
      legalApproved
      legalApprovedAt
      legalApprovedBy
      legalLockedAt
      mimeType
      organizationId
      owner
      projectId
      s3Key
      shotDescription
      shotListItemId
      storageClass
      thumbnailKey
      type
      updatedAt
      usageHeatmap
      version
      __typename
    }
    assetId
    beard
    boundingBox
    confidence
    createdAt
    emotions
    eyeglasses
    eyesOpen
    gender
    id
    landmarks
    mouthOpen
    mustache
    organizationId
    personId
    personName
    processingJobId
    projectId
    smile
    sunglasses
    timestamp
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetAIFaceDetectionQueryVariables,
  APITypes.GetAIFaceDetectionQuery
>;
export const getAISceneDetection = /* GraphQL */ `query GetAISceneDetection($id: ID!) {
  getAISceneDetection(id: $id) {
    asset {
      aiConfidence
      aiProcessedAt
      aiTags
      approvalRequirements
      approvalState
      clientApprovalNote
      clientApproved
      clientApprovedAt
      clientApprovedBy
      createdAt
      dimensions
      duration
      fileSize
      finalApprovedAt
      finalApprovedBy
      id
      internalApprovalNote
      internalApproved
      internalApprovedAt
      internalApprovedBy
      isBRoll
      isLegalLocked
      isPlannedShot
      legalApprovalNote
      legalApproved
      legalApprovedAt
      legalApprovedBy
      legalLockedAt
      mimeType
      organizationId
      owner
      projectId
      s3Key
      shotDescription
      shotListItemId
      storageClass
      thumbnailKey
      type
      updatedAt
      usageHeatmap
      version
      __typename
    }
    assetId
    confidence
    createdAt
    duration
    endTime
    id
    labels
    lighting
    movement
    organizationId
    processingJobId
    projectId
    shotType
    startTime
    thumbnailKey
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetAISceneDetectionQueryVariables,
  APITypes.GetAISceneDetectionQuery
>;
export const getAITranscript = /* GraphQL */ `query GetAITranscript($id: ID!) {
  getAITranscript(id: $id) {
    asset {
      aiConfidence
      aiProcessedAt
      aiTags
      approvalRequirements
      approvalState
      clientApprovalNote
      clientApproved
      clientApprovedAt
      clientApprovedBy
      createdAt
      dimensions
      duration
      fileSize
      finalApprovedAt
      finalApprovedBy
      id
      internalApprovalNote
      internalApproved
      internalApprovedAt
      internalApprovedBy
      isBRoll
      isLegalLocked
      isPlannedShot
      legalApprovalNote
      legalApproved
      legalApprovedAt
      legalApprovedBy
      legalLockedAt
      mimeType
      organizationId
      owner
      projectId
      s3Key
      shotDescription
      shotListItemId
      storageClass
      thumbnailKey
      type
      updatedAt
      usageHeatmap
      version
      __typename
    }
    assetId
    confidence
    createdAt
    endTime
    id
    languageCode
    organizationId
    processingJobId
    projectId
    speakerId
    speakerName
    startTime
    text
    updatedAt
    words
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetAITranscriptQueryVariables,
  APITypes.GetAITranscriptQuery
>;
export const getAccessException = /* GraphQL */ `query GetAccessException($id: ID!) {
  getAccessException(id: $id) {
    approvedAt
    approvedBy
    approvedByEmail
    approverRole
    createdAt
    denialReason
    durationHours
    expiresAt
    id
    organizationId
    owner
    projectId
    reason
    requestedAction
    requestedAssetId
    requestedAt
    requestedBy
    requestedByEmail
    status
    targetUserEmail
    targetUserId
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetAccessExceptionQueryVariables,
  APITypes.GetAccessExceptionQuery
>;
export const getActivityLog = /* GraphQL */ `query GetActivityLog($id: ID!) {
  getActivityLog(id: $id) {
    action
    createdAt
    id
    ipAddress
    metadata
    organizationId
    project {
      archiveComplete
      archiveCompletedAt
      archiveLocation
      assetsDelivered
      assetsDeliveredAt
      briefComplete
      briefCompletedAt
      budgetApproved
      budgetApprovedAt
      budgetCap
      budgetContingency
      budgetDistribution
      budgetPostProduction
      budgetPreProduction
      budgetProduction
      callSheetsReady
      callSheetsReadyAt
      clientContactEmail
      confidentiality
      contractsSigned
      contractsSignedAt
      createdAt
      creativeDirectorEmail
      deadline
      deliverablesReady
      deliverablesReadyAt
      deliveryConfirmedBy
      department
      description
      distributionDate
      executiveSponsorEmail
      fieldIntelligenceFeasibilityScore
      fieldIntelligenceHealthAlerts
      fieldIntelligenceLastUpdated
      fieldIntelligenceRiskAlerts
      fieldIntelligenceWeatherData
      finalApproved
      finalApprovedAt
      finalApprovedBy
      finalAssetId
      financeContactEmail
      fundingSource
      greenlightBlockers
      greenlightClientApproved
      greenlightClientApprovedAt
      greenlightClientApprovedBy
      greenlightClientComment
      greenlightCompletedAt
      greenlightExecutiveApproved
      greenlightExecutiveApprovedAt
      greenlightExecutiveApprovedBy
      greenlightExecutiveComment
      greenlightFinanceApproved
      greenlightFinanceApprovedAt
      greenlightFinanceApprovedBy
      greenlightFinanceComment
      greenlightLegalApproved
      greenlightLegalApprovedAt
      greenlightLegalApprovedBy
      greenlightLegalComment
      greenlightProducerApproved
      greenlightProducerApprovedAt
      greenlightProducerApprovedBy
      greenlightProducerComment
      greenlightRequirements
      id
      kickoffDate
      legalApproved
      legalApprovedAt
      legalContactEmail
      legalLockDeadline
      lifecycleState
      locationsConfirmed
      locationsConfirmedAt
      mediaIngested
      name
      organizationId
      owner
      permitsObtained
      permitsObtainedAt
      postProductionEndDate
      postProductionStartDate
      preProductionEndDate
      preProductionStartDate
      primaryKPI
      principalPhotographyComplete
      principalPhotographyCompleteAt
      priority
      producerEmail
      productionEndDate
      productionStartDate
      projectOwnerEmail
      projectType
      purchaseOrderNumber
      reviewDeadline
      roughCutAssetId
      roughCutComplete
      roughCutCompleteAt
      shootLocationCity
      shootLocationCoordinates
      shootLocationCountry
      stakeholderSignoff
      stakeholderSignoffAt
      status
      targetMetric
      teamAssigned
      updatedAt
      __typename
    }
    projectId
    targetId
    targetName
    targetType
    updatedAt
    userEmail
    userId
    userRole
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetActivityLogQueryVariables,
  APITypes.GetActivityLogQuery
>;
export const getArchiveAsset = /* GraphQL */ `query GetArchiveAsset($id: ID!) {
  getArchiveAsset(id: $id) {
    aiEmotions
    aiFaces
    aiObjects
    aiSceneDescription
    aiSentiment
    aiSummary
    aiTextOnScreen
    aiTranscript
    aspectRatio
    assetId
    audioChannels
    audioCodec
    audioSampleRate
    bitDepth
    bitrate
    camera
    cameraSettings
    childAssetIds
    codec
    colorPalette
    colorSpace
    createdAt
    creativeMetadata
    duration
    fileSizeBytes
    frameRate
    fullTextIndex
    glacierArchiveId
    glacierVaultId
    hdr
    id
    labels
    lastTierChangeAt
    lastUsedAt
    lastUsedBy
    legalMetadata
    lens
    linkedProjects
    linkedVersions
    locationReleases
    mood
    operationalMetadata
    organizationId
    parentAssetId
    partialRetrievalSupported
    permitExpiry
    permitId
    projectId
    proxyKey
    regionRestrictions
    releaseStatus
    resolution
    rightsExpiration
    riskFactors
    riskScore
    s3Bucket
    s3Key
    sceneNumber
    searchVector
    shotType
    storageMetadata
    storageTier
    subjects
    takeNumber
    talentReleases
    technicalMetadata
    thawCostEstimate
    thumbnailKey
    tierChangeHistory
    transcriptKeywords
    updatedAt
    uploadTimestamp
    uploaderEmail
    uploaderName
    usageCount
    usageRestrictions
    visualStyle
    waveformKey
    workflowStage
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetArchiveAssetQueryVariables,
  APITypes.GetArchiveAssetQuery
>;
export const getArchivePolicy = /* GraphQL */ `query GetArchivePolicy($id: ID!) {
  getArchivePolicy(id: $id) {
    assetsProcessed
    createdAt
    createdBy
    createdByEmail
    daysUntilArchive
    description
    excludeAssetTypes
    excludeTaggedWith
    id
    includeAssetTypes
    isEnabled
    lastExecutedAt
    minFileSizeMB
    name
    nextScheduledRun
    onlyProjectStatus
    organizationId
    projectId
    storageFreedGB
    targetStorageClass
    triggerType
    updatedAt
    usageScoreThreshold
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetArchivePolicyQueryVariables,
  APITypes.GetArchivePolicyQuery
>;
export const getAsset = /* GraphQL */ `query GetAsset($id: ID!) {
  getAsset(id: $id) {
    aiAnalysisJobs {
      nextToken
      __typename
    }
    aiConfidence
    aiFaceDetections {
      nextToken
      __typename
    }
    aiProcessedAt
    aiSceneDetections {
      nextToken
      __typename
    }
    aiTags
    aiTranscripts {
      nextToken
      __typename
    }
    approvalRequirements
    approvalState
    clientApprovalNote
    clientApproved
    clientApprovedAt
    clientApprovedBy
    createdAt
    dimensions
    duration
    fileSize
    finalApprovedAt
    finalApprovedBy
    id
    internalApprovalNote
    internalApproved
    internalApprovedAt
    internalApprovedBy
    isBRoll
    isLegalLocked
    isPlannedShot
    legalApprovalNote
    legalApproved
    legalApprovedAt
    legalApprovedBy
    legalLockedAt
    mimeType
    organizationId
    owner
    project {
      archiveComplete
      archiveCompletedAt
      archiveLocation
      assetsDelivered
      assetsDeliveredAt
      briefComplete
      briefCompletedAt
      budgetApproved
      budgetApprovedAt
      budgetCap
      budgetContingency
      budgetDistribution
      budgetPostProduction
      budgetPreProduction
      budgetProduction
      callSheetsReady
      callSheetsReadyAt
      clientContactEmail
      confidentiality
      contractsSigned
      contractsSignedAt
      createdAt
      creativeDirectorEmail
      deadline
      deliverablesReady
      deliverablesReadyAt
      deliveryConfirmedBy
      department
      description
      distributionDate
      executiveSponsorEmail
      fieldIntelligenceFeasibilityScore
      fieldIntelligenceHealthAlerts
      fieldIntelligenceLastUpdated
      fieldIntelligenceRiskAlerts
      fieldIntelligenceWeatherData
      finalApproved
      finalApprovedAt
      finalApprovedBy
      finalAssetId
      financeContactEmail
      fundingSource
      greenlightBlockers
      greenlightClientApproved
      greenlightClientApprovedAt
      greenlightClientApprovedBy
      greenlightClientComment
      greenlightCompletedAt
      greenlightExecutiveApproved
      greenlightExecutiveApprovedAt
      greenlightExecutiveApprovedBy
      greenlightExecutiveComment
      greenlightFinanceApproved
      greenlightFinanceApprovedAt
      greenlightFinanceApprovedBy
      greenlightFinanceComment
      greenlightLegalApproved
      greenlightLegalApprovedAt
      greenlightLegalApprovedBy
      greenlightLegalComment
      greenlightProducerApproved
      greenlightProducerApprovedAt
      greenlightProducerApprovedBy
      greenlightProducerComment
      greenlightRequirements
      id
      kickoffDate
      legalApproved
      legalApprovedAt
      legalContactEmail
      legalLockDeadline
      lifecycleState
      locationsConfirmed
      locationsConfirmedAt
      mediaIngested
      name
      organizationId
      owner
      permitsObtained
      permitsObtainedAt
      postProductionEndDate
      postProductionStartDate
      preProductionEndDate
      preProductionStartDate
      primaryKPI
      principalPhotographyComplete
      principalPhotographyCompleteAt
      priority
      producerEmail
      productionEndDate
      productionStartDate
      projectOwnerEmail
      projectType
      purchaseOrderNumber
      reviewDeadline
      roughCutAssetId
      roughCutComplete
      roughCutCompleteAt
      shootLocationCity
      shootLocationCoordinates
      shootLocationCountry
      stakeholderSignoff
      stakeholderSignoffAt
      status
      targetMetric
      teamAssigned
      updatedAt
      __typename
    }
    projectId
    reviews {
      nextToken
      __typename
    }
    s3Key
    shotDescription
    shotListItemId
    storageClass
    thumbnailKey
    type
    updatedAt
    usageHeatmap
    version
    versions {
      nextToken
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<APITypes.GetAssetQueryVariables, APITypes.GetAssetQuery>;
export const getAssetAnalytics = /* GraphQL */ `query GetAssetAnalytics($id: ID!) {
  getAssetAnalytics(id: $id) {
    approvalCount
    assetId
    averageRating
    averageWatchPercentage
    commentCount
    createdAt
    dataIntegrity
    distributionLinksCreated
    downloadCount
    estimatedValue
    externalEmbeds
    feedbackSentiment
    firstViewedAt
    id
    lastUpdated
    lastViewedAt
    organizationId
    peakUsageCount
    peakUsageDate
    productionCost
    projectId
    revenueGenerated
    revisionRequestCount
    roiLastCalculated
    roiPercentage
    shareCount
    socialOutputsCreated
    totalPlayDuration
    totalViews
    uniqueViewers
    updatedAt
    usageScore
    usageScoreUpdatedAt
    usageTrend
    viewerDevices
    viewerLocations
    viewsByDay
    viewsByHour
    viewsByMonth
    viewsByWeek
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetAssetAnalyticsQueryVariables,
  APITypes.GetAssetAnalyticsQuery
>;
export const getAssetLineage = /* GraphQL */ `query GetAssetLineage($id: ID!) {
  getAssetLineage(id: $id) {
    approvals
    approvedAt
    approvedBy
    childAssets
    createdAt
    currentVersion
    derivationDetails
    derivationType
    generationNumber
    id
    inheritedMetadata
    isApproved
    lastUsedAt
    masterAssetId
    masterAssetName
    masterProjectId
    organizationId
    overriddenMetadata
    updatedAt
    usageCount
    usedInDeliverables
    usedInProjects
    versionHistory
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetAssetLineageQueryVariables,
  APITypes.GetAssetLineageQuery
>;
export const getAssetUsageHeatmap = /* GraphQL */ `query GetAssetUsageHeatmap($id: ID!) {
  getAssetUsageHeatmap(id: $id) {
    archiveRecommendation
    archiveRecommendationReason
    assetId
    createdAt
    dataQuality
    deliverableCount
    engagementRate
    estimatedImpressions
    estimatedRevenueGenerated
    id
    lastCalculated
    lastUsed
    organizationId
    peakUsageCount
    peakUsageDate
    platformUsage
    predictedUsageNext30Days
    productionCost
    projectId
    recommendedStorageTier
    relatedDeliverables
    reusabilityScore
    roiScore
    strategicValue
    topUsers
    trendAnalysis
    uniquenessScore
    updatedAt
    usageByDayOfWeek
    usageByHour
    usageByMonth
    usageByWeek
    usageTrend
    useByRole
    useByTeam
    useByUser
    useFrequencyDaily
    useFrequencyMonthly
    useFrequencyWeekly
    valueJustification
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetAssetUsageHeatmapQueryVariables,
  APITypes.GetAssetUsageHeatmapQuery
>;
export const getAssetVersion = /* GraphQL */ `query GetAssetVersion($id: ID!) {
  getAssetVersion(id: $id) {
    asset {
      aiConfidence
      aiProcessedAt
      aiTags
      approvalRequirements
      approvalState
      clientApprovalNote
      clientApproved
      clientApprovedAt
      clientApprovedBy
      createdAt
      dimensions
      duration
      fileSize
      finalApprovedAt
      finalApprovedBy
      id
      internalApprovalNote
      internalApproved
      internalApprovedAt
      internalApprovedBy
      isBRoll
      isLegalLocked
      isPlannedShot
      legalApprovalNote
      legalApproved
      legalApprovedAt
      legalApprovedBy
      legalLockedAt
      mimeType
      organizationId
      owner
      projectId
      s3Key
      shotDescription
      shotListItemId
      storageClass
      thumbnailKey
      type
      updatedAt
      usageHeatmap
      version
      __typename
    }
    assetId
    changeDescription
    createdAt
    createdBy
    createdByEmail
    fileSize
    id
    isCurrentVersion
    isReviewReady
    mimeType
    organizationId
    previousVersionId
    projectId
    s3Key
    updatedAt
    versionLabel
    versionNumber
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetAssetVersionQueryVariables,
  APITypes.GetAssetVersionQuery
>;
export const getAudioCue = /* GraphQL */ `query GetAudioCue($id: ID!) {
  getAudioCue(id: $id) {
    actor
    character
    clearanceDate
    clearanceNotes
    clearanceStatus
    composer
    createdAt
    createdBy
    cueNumber
    cueType
    duration
    editedKey
    id
    licenseFee
    lineText
    masterOwner
    name
    notes
    organizationId
    projectId
    publisher
    recordingDate
    recordingFacility
    recordingStatus
    sourceKey
    syncOwner
    term
    territories
    timecodeIn
    timecodeOut
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetAudioCueQueryVariables,
  APITypes.GetAudioCueQuery
>;
export const getAuditLog = /* GraphQL */ `query GetAuditLog($id: ID!) {
  getAuditLog(id: $id) {
    action
    actionCategory
    assetId
    createdAt
    deniedReason
    details
    geoLocation
    id
    ipAddress
    isExternal
    organizationId
    projectId
    resourceId
    resourceType
    sessionId
    success
    timestamp
    updatedAt
    userAgent
    userEmail
    userId
    userRole
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetAuditLogQueryVariables,
  APITypes.GetAuditLogQuery
>;
export const getBrief = /* GraphQL */ `query GetBrief($id: ID!) {
  getBrief(id: $id) {
    accessibilityRequired
    aiProcessedAt
    approvedByFinance
    approvedByLegal
    approvedByProducer
    brandGuidelines
    budgetRange
    complexity
    copyrightOwnership
    covidProtocolsRequired
    createdAt
    creativeProposals
    crewRoles
    deliverables
    distributionChannels
    embargoDate
    equipmentNeeds
    estimatedDuration
    geoRights
    hasDroneRisk
    hasHazardousLocationRisk
    hasMinorRisk
    hasPublicSpaceRisk
    hasStuntRisk
    id
    inspirationReferences
    insuranceRequired
    keyMessages
    languageVersions
    locationDetails
    locationReleasesRequired
    masterFormat
    musicLicensing
    organizationId
    project {
      archiveComplete
      archiveCompletedAt
      archiveLocation
      assetsDelivered
      assetsDeliveredAt
      briefComplete
      briefCompletedAt
      budgetApproved
      budgetApprovedAt
      budgetCap
      budgetContingency
      budgetDistribution
      budgetPostProduction
      budgetPreProduction
      budgetProduction
      callSheetsReady
      callSheetsReadyAt
      clientContactEmail
      confidentiality
      contractsSigned
      contractsSignedAt
      createdAt
      creativeDirectorEmail
      deadline
      deliverablesReady
      deliverablesReadyAt
      deliveryConfirmedBy
      department
      description
      distributionDate
      executiveSponsorEmail
      fieldIntelligenceFeasibilityScore
      fieldIntelligenceHealthAlerts
      fieldIntelligenceLastUpdated
      fieldIntelligenceRiskAlerts
      fieldIntelligenceWeatherData
      finalApproved
      finalApprovedAt
      finalApprovedBy
      finalAssetId
      financeContactEmail
      fundingSource
      greenlightBlockers
      greenlightClientApproved
      greenlightClientApprovedAt
      greenlightClientApprovedBy
      greenlightClientComment
      greenlightCompletedAt
      greenlightExecutiveApproved
      greenlightExecutiveApprovedAt
      greenlightExecutiveApprovedBy
      greenlightExecutiveComment
      greenlightFinanceApproved
      greenlightFinanceApprovedAt
      greenlightFinanceApprovedBy
      greenlightFinanceComment
      greenlightLegalApproved
      greenlightLegalApprovedAt
      greenlightLegalApprovedBy
      greenlightLegalComment
      greenlightProducerApproved
      greenlightProducerApprovedAt
      greenlightProducerApprovedBy
      greenlightProducerComment
      greenlightRequirements
      id
      kickoffDate
      legalApproved
      legalApprovedAt
      legalContactEmail
      legalLockDeadline
      lifecycleState
      locationsConfirmed
      locationsConfirmedAt
      mediaIngested
      name
      organizationId
      owner
      permitsObtained
      permitsObtainedAt
      postProductionEndDate
      postProductionStartDate
      preProductionEndDate
      preProductionStartDate
      primaryKPI
      principalPhotographyComplete
      principalPhotographyCompleteAt
      priority
      producerEmail
      productionEndDate
      productionStartDate
      projectOwnerEmail
      projectType
      purchaseOrderNumber
      reviewDeadline
      roughCutAssetId
      roughCutComplete
      roughCutCompleteAt
      shootLocationCity
      shootLocationCoordinates
      shootLocationCountry
      stakeholderSignoff
      stakeholderSignoffAt
      status
      targetMetric
      teamAssigned
      updatedAt
      __typename
    }
    projectDescription
    projectId
    requiredPermits
    riskLevel
    safetyOfficerNeeded
    scenes
    scriptOrNotes
    selectedProposalId
    socialCropsRequired
    stockFootageNeeded
    subtitlesRequired
    talentOnScreen
    talentReleasesRequired
    talentVoiceOver
    targetAudience
    tone
    unionRules
    updatedAt
    usageRightsDuration
    __typename
  }
}
` as GeneratedQuery<APITypes.GetBriefQueryVariables, APITypes.GetBriefQuery>;
export const getBudgetLineItem = /* GraphQL */ `query GetBudgetLineItem($id: ID!) {
  getBudgetLineItem(id: $id) {
    actualAmount
    actualUnits
    approvedAt
    approvedBy
    category
    createdAt
    createdBy
    createdByEmail
    description
    endDate
    estimatedAmount
    estimatedUnits
    id
    notes
    organizationId
    phase
    projectId
    purchaseOrderNumber
    startDate
    status
    subcategory
    unitRate
    unitType
    updatedAt
    variance
    vendorContact
    vendorName
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetBudgetLineItemQueryVariables,
  APITypes.GetBudgetLineItemQuery
>;
export const getCallSheet = /* GraphQL */ `query GetCallSheet($id: ID!) {
  getCallSheet(id: $id) {
    castMembers {
      nextToken
      __typename
    }
    cateringLocation
    createdAt
    crewMembers {
      nextToken
      __typename
    }
    directorName
    directorPhone
    episodeNumber
    estimatedWrap
    firstADName
    firstADPhone
    generalCrewCall
    hospitalAddress
    id
    lastUpdatedBy
    mealTimes
    nearestHospital
    nextDaySchedule
    organizationId
    parkingInstructions
    primaryLocation
    primaryLocationAddress
    producerName
    producerPhone
    productionCompany
    productionManagerName
    productionManagerPhone
    productionOfficePhone
    productionTitle
    project {
      archiveComplete
      archiveCompletedAt
      archiveLocation
      assetsDelivered
      assetsDeliveredAt
      briefComplete
      briefCompletedAt
      budgetApproved
      budgetApprovedAt
      budgetCap
      budgetContingency
      budgetDistribution
      budgetPostProduction
      budgetPreProduction
      budgetProduction
      callSheetsReady
      callSheetsReadyAt
      clientContactEmail
      confidentiality
      contractsSigned
      contractsSignedAt
      createdAt
      creativeDirectorEmail
      deadline
      deliverablesReady
      deliverablesReadyAt
      deliveryConfirmedBy
      department
      description
      distributionDate
      executiveSponsorEmail
      fieldIntelligenceFeasibilityScore
      fieldIntelligenceHealthAlerts
      fieldIntelligenceLastUpdated
      fieldIntelligenceRiskAlerts
      fieldIntelligenceWeatherData
      finalApproved
      finalApprovedAt
      finalApprovedBy
      finalAssetId
      financeContactEmail
      fundingSource
      greenlightBlockers
      greenlightClientApproved
      greenlightClientApprovedAt
      greenlightClientApprovedBy
      greenlightClientComment
      greenlightCompletedAt
      greenlightExecutiveApproved
      greenlightExecutiveApprovedAt
      greenlightExecutiveApprovedBy
      greenlightExecutiveComment
      greenlightFinanceApproved
      greenlightFinanceApprovedAt
      greenlightFinanceApprovedBy
      greenlightFinanceComment
      greenlightLegalApproved
      greenlightLegalApprovedAt
      greenlightLegalApprovedBy
      greenlightLegalComment
      greenlightProducerApproved
      greenlightProducerApprovedAt
      greenlightProducerApprovedBy
      greenlightProducerComment
      greenlightRequirements
      id
      kickoffDate
      legalApproved
      legalApprovedAt
      legalContactEmail
      legalLockDeadline
      lifecycleState
      locationsConfirmed
      locationsConfirmedAt
      mediaIngested
      name
      organizationId
      owner
      permitsObtained
      permitsObtainedAt
      postProductionEndDate
      postProductionStartDate
      preProductionEndDate
      preProductionStartDate
      primaryKPI
      principalPhotographyComplete
      principalPhotographyCompleteAt
      priority
      producerEmail
      productionEndDate
      productionStartDate
      projectOwnerEmail
      projectType
      purchaseOrderNumber
      reviewDeadline
      roughCutAssetId
      roughCutComplete
      roughCutCompleteAt
      shootLocationCity
      shootLocationCoordinates
      shootLocationCountry
      stakeholderSignoff
      stakeholderSignoffAt
      status
      targetMetric
      teamAssigned
      updatedAt
      __typename
    }
    projectId
    publishedAt
    safetyNotes
    scenes {
      nextToken
      __typename
    }
    shootDate
    shootDayNumber
    specialInstructions
    status
    sunset
    temperature
    timezone
    totalShootDays
    transportationNotes
    updatedAt
    version
    weatherForecast
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCallSheetQueryVariables,
  APITypes.GetCallSheetQuery
>;
export const getCallSheetCast = /* GraphQL */ `query GetCallSheetCast($id: ID!) {
  getCallSheetCast(id: $id) {
    actorName
    callSheet {
      cateringLocation
      createdAt
      directorName
      directorPhone
      episodeNumber
      estimatedWrap
      firstADName
      firstADPhone
      generalCrewCall
      hospitalAddress
      id
      lastUpdatedBy
      mealTimes
      nearestHospital
      nextDaySchedule
      organizationId
      parkingInstructions
      primaryLocation
      primaryLocationAddress
      producerName
      producerPhone
      productionCompany
      productionManagerName
      productionManagerPhone
      productionOfficePhone
      productionTitle
      projectId
      publishedAt
      safetyNotes
      shootDate
      shootDayNumber
      specialInstructions
      status
      sunset
      temperature
      timezone
      totalShootDays
      transportationNotes
      updatedAt
      version
      weatherForecast
      __typename
    }
    callSheetId
    callToSet
    characterName
    createdAt
    email
    id
    makeupCall
    notes
    phone
    pickupLocation
    pickupTime
    sortOrder
    updatedAt
    wardrobeCall
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCallSheetCastQueryVariables,
  APITypes.GetCallSheetCastQuery
>;
export const getCallSheetCrew = /* GraphQL */ `query GetCallSheetCrew($id: ID!) {
  getCallSheetCrew(id: $id) {
    callSheet {
      cateringLocation
      createdAt
      directorName
      directorPhone
      episodeNumber
      estimatedWrap
      firstADName
      firstADPhone
      generalCrewCall
      hospitalAddress
      id
      lastUpdatedBy
      mealTimes
      nearestHospital
      nextDaySchedule
      organizationId
      parkingInstructions
      primaryLocation
      primaryLocationAddress
      producerName
      producerPhone
      productionCompany
      productionManagerName
      productionManagerPhone
      productionOfficePhone
      productionTitle
      projectId
      publishedAt
      safetyNotes
      shootDate
      shootDayNumber
      specialInstructions
      status
      sunset
      temperature
      timezone
      totalShootDays
      transportationNotes
      updatedAt
      version
      weatherForecast
      __typename
    }
    callSheetId
    callTime
    createdAt
    department
    email
    id
    name
    notes
    phone
    role
    sortOrder
    updatedAt
    walkieChannel
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCallSheetCrewQueryVariables,
  APITypes.GetCallSheetCrewQuery
>;
export const getCallSheetScene = /* GraphQL */ `query GetCallSheetScene($id: ID!) {
  getCallSheetScene(id: $id) {
    callSheet {
      cateringLocation
      createdAt
      directorName
      directorPhone
      episodeNumber
      estimatedWrap
      firstADName
      firstADPhone
      generalCrewCall
      hospitalAddress
      id
      lastUpdatedBy
      mealTimes
      nearestHospital
      nextDaySchedule
      organizationId
      parkingInstructions
      primaryLocation
      primaryLocationAddress
      producerName
      producerPhone
      productionCompany
      productionManagerName
      productionManagerPhone
      productionOfficePhone
      productionTitle
      projectId
      publishedAt
      safetyNotes
      shootDate
      shootDayNumber
      specialInstructions
      status
      sunset
      temperature
      timezone
      totalShootDays
      transportationNotes
      updatedAt
      version
      weatherForecast
      __typename
    }
    callSheetId
    createdAt
    description
    estimatedDuration
    id
    location
    notes
    pageCount
    sceneHeading
    sceneNumber
    scheduledTime
    sortOrder
    status
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCallSheetSceneQueryVariables,
  APITypes.GetCallSheetSceneQuery
>;
export const getCollection = /* GraphQL */ `query GetCollection($id: ID!) {
  getCollection(id: $id) {
    allowComments
    allowDownloads
    assetCount
    collectionType
    color
    coverImageKey
    createdAt
    createdBy
    createdByEmail
    description
    icon
    id
    isSmartCollection
    lastModifiedAt
    lastModifiedBy
    name
    organizationId
    projectId
    shareLink
    shareLinkExpiry
    shareLinkPassword
    sharedWith
    smartLastUpdated
    smartRules
    sortBy
    sortOrder
    tags
    totalSizeBytes
    updatedAt
    viewMode
    visibility
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCollectionQueryVariables,
  APITypes.GetCollectionQuery
>;
export const getCollectionAsset = /* GraphQL */ `query GetCollectionAsset($id: ID!) {
  getCollectionAsset(id: $id) {
    addedAt
    addedBy
    addedByEmail
    assetId
    collectionId
    createdAt
    id
    notes
    organizationId
    selectedClipIn
    selectedClipOut
    selectedFrameTimecode
    sortOrder
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCollectionAssetQueryVariables,
  APITypes.GetCollectionAssetQuery
>;
export const getColorSession = /* GraphQL */ `query GetColorSession($id: ID!) {
  getColorSession(id: $id) {
    cdlOffset
    cdlPower
    cdlSaturation
    cdlSlope
    colorSpace
    coloristEmail
    coloristName
    cost
    createdAt
    createdBy
    durationHours
    facility
    hdrFormat
    id
    lookApproved
    lookApprovedAt
    lookApprovedBy
    lutFileName
    lutKey
    name
    notes
    organizationId
    peakNits
    projectId
    sessionDate
    stage
    status
    suite
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetColorSessionQueryVariables,
  APITypes.GetColorSessionQuery
>;
export const getCrewCost = /* GraphQL */ `query GetCrewCost($id: ID!) {
  getCrewCost(id: $id) {
    baseCost
    baseRate
    callSheetId
    callTime
    createdAt
    createdBy
    crewMemberEmail
    crewMemberName
    deductions
    department
    doubleTimeCost
    doubleTimeHours
    id
    kitFee
    kitFeeCost
    mealPenaltyCost
    mealPenaltyHours
    mileageCost
    mileageRate
    netPay
    notes
    organizationId
    overtimeCost
    overtimeHours
    overtimeRate
    paymentDate
    paymentReference
    paymentStatus
    perDiem
    perDiemCost
    projectId
    rateType
    regularHours
    role
    shootDay
    taxWithheld
    timesheetApproved
    timesheetApprovedAt
    timesheetApprovedBy
    timesheetKey
    totalCost
    travelHours
    updatedAt
    workDate
    wrapTime
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCrewCostQueryVariables,
  APITypes.GetCrewCostQuery
>;
export const getCustomMetadataSchema = /* GraphQL */ `query GetCustomMetadataSchema($id: ID!) {
  getCustomMetadataSchema(id: $id) {
    appliesTo
    assetTypes
    canEditRoles
    canViewRoles
    collapsedByDefault
    createdAt
    createdBy
    description
    displayOrder
    fields
    id
    isActive
    lastModifiedAt
    lastModifiedBy
    name
    organizationId
    showInDetail
    showInList
    slug
    updatedAt
    version
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCustomMetadataSchemaQueryVariables,
  APITypes.GetCustomMetadataSchemaQuery
>;
export const getCustomMetadataValue = /* GraphQL */ `query GetCustomMetadataValue($id: ID!) {
  getCustomMetadataValue(id: $id) {
    changeHistory
    createdAt
    createdBy
    id
    lastModifiedAt
    lastModifiedBy
    organizationId
    schemaId
    targetId
    targetType
    updatedAt
    values
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCustomMetadataValueQueryVariables,
  APITypes.GetCustomMetadataValueQuery
>;
export const getDailyCostSummary = /* GraphQL */ `query GetDailyCostSummary($id: ID!) {
  getDailyCostSummary(id: $id) {
    callSheetId
    cateringCost
    createdAt
    createdBy
    crewBaseCost
    crewCount
    crewKitFees
    crewOvertimeCost
    crewOvertimeHours
    crewPerDiem
    crewTotalCost
    crewTotalHours
    date
    equipmentOwnedCost
    equipmentRentalCost
    equipmentTotalCost
    finalizedAt
    finalizedBy
    id
    isFinalized
    issues
    locationFees
    locationTotalCost
    miscCost
    notes
    organizationId
    otherTotalCost
    parkingCost
    permitFees
    projectId
    shootDay
    talentFees
    talentPerDiem
    talentTotalCost
    totalActualCost
    totalPlannedCost
    transportCost
    updatedAt
    variance
    variancePercentage
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetDailyCostSummaryQueryVariables,
  APITypes.GetDailyCostSummaryQuery
>;
export const getDailyProductionReport = /* GraphQL */ `query GetDailyProductionReport($id: ID!) {
  getDailyProductionReport(id: $id) {
    approvedAt
    approvedBy
    cameraWrap
    cardsUsed
    completedScenes
    createdAt
    createdBy
    createdByEmail
    crewCall
    crewWrap
    date
    director
    firstAD
    firstShot
    goodTakes
    id
    incidents
    lastShot
    lunchEnd
    lunchStart
    mealPenalties
    organizationId
    overtimeCrew
    partialScenes
    producer
    productionNotes
    projectId
    rejectionReason
    runningTotal
    scheduledScenes
    shootDay
    status
    storageUsedGB
    submittedAt
    submittedBy
    temperature
    tomorrowPrep
    totalCrewMembers
    totalMinutesShot
    totalSetups
    totalTakes
    unit
    updatedAt
    upm
    weatherConditions
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetDailyProductionReportQueryVariables,
  APITypes.GetDailyProductionReportQuery
>;
export const getDistributionLink = /* GraphQL */ `query GetDistributionLink($id: ID!) {
  getDistributionLink(id: $id) {
    accessCode
    accessToken
    allowDownload
    allowShare
    allowedCountries
    assetId
    assetVersionId
    averageViewDuration
    blockedCountries
    completionRate
    createdAt
    createdBy
    createdByEmail
    currentViews
    description
    downloadResolution
    expiresAt
    geoRestriction
    id
    isExpired
    isPasswordProtected
    isWatermarked
    lastAccessedAt
    lastAccessedBy
    lastAccessedFrom
    linkType
    maxViews
    name
    notifyOnDownload
    notifyOnView
    organizationId
    playlistAssetIds
    projectId
    recipientCompany
    recipientEmail
    recipientName
    recipientRole
    revokedAt
    revokedBy
    revokedReason
    status
    streamQuality
    totalViewDuration
    updatedAt
    viewLogs {
      nextToken
      __typename
    }
    watermarkOpacity
    watermarkPosition
    watermarkText
    watermarkType
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetDistributionLinkQueryVariables,
  APITypes.GetDistributionLinkQuery
>;
export const getDistributionViewLog = /* GraphQL */ `query GetDistributionViewLog($id: ID!) {
  getDistributionViewLog(id: $id) {
    averageBitrate
    bufferingDuration
    bufferingEvents
    createdAt
    distributionLink {
      accessCode
      accessToken
      allowDownload
      allowShare
      allowedCountries
      assetId
      assetVersionId
      averageViewDuration
      blockedCountries
      completionRate
      createdAt
      createdBy
      createdByEmail
      currentViews
      description
      downloadResolution
      expiresAt
      geoRestriction
      id
      isExpired
      isPasswordProtected
      isWatermarked
      lastAccessedAt
      lastAccessedBy
      lastAccessedFrom
      linkType
      maxViews
      name
      notifyOnDownload
      notifyOnView
      organizationId
      playlistAssetIds
      projectId
      recipientCompany
      recipientEmail
      recipientName
      recipientRole
      revokedAt
      revokedBy
      revokedReason
      status
      streamQuality
      totalViewDuration
      updatedAt
      watermarkOpacity
      watermarkPosition
      watermarkText
      watermarkType
      __typename
    }
    distributionLinkId
    downloadAttempted
    duration
    endTime
    geoBlockReason
    geoBlocked
    id
    pauseEvents
    percentageWatched
    playbackSpeed
    qualityChanges
    screenshotAttempted
    seekEvents
    sessionId
    startTime
    updatedAt
    viewerBrowser
    viewerCity
    viewerCountry
    viewerDevice
    viewerEmail
    viewerIP
    viewerName
    viewerOS
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetDistributionViewLogQueryVariables,
  APITypes.GetDistributionViewLogQuery
>;
export const getDownloadRequest = /* GraphQL */ `query GetDownloadRequest($id: ID!) {
  getDownloadRequest(id: $id) {
    applyWatermark
    assetIds
    burnInSubtitles
    burnInTimecode
    collectionId
    completedAt
    createdAt
    downloadCount
    downloadKey
    downloadUrl
    downloadedBy
    errorMessage
    expiresAt
    fileCount
    folderStructure
    id
    includeMetadata
    includeSidecar
    includeTranscript
    lastDownloadedAt
    organizationId
    outputCodec
    outputFormat
    outputFrameRate
    outputResolution
    packageFormat
    progress
    requestType
    requestedAt
    requestedBy
    requestedByEmail
    startedAt
    status
    totalSizeBytes
    updatedAt
    watermarkOpacity
    watermarkPosition
    watermarkText
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetDownloadRequestQueryVariables,
  APITypes.GetDownloadRequestQuery
>;
export const getEditSession = /* GraphQL */ `query GetEditSession($id: ID!) {
  getEditSession(id: $id) {
    addressedNotes
    approvedAt
    approvedBy
    completedAt
    createdAt
    createdBy
    duration
    editorEmail
    editorName
    exportKey
    frameRate
    id
    isCurrentVersion
    name
    organizationId
    projectId
    resolution
    stage
    startedAt
    status
    timelineKey
    totalNotes
    updatedAt
    versionNumber
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetEditSessionQueryVariables,
  APITypes.GetEditSessionQuery
>;
export const getEquipment = /* GraphQL */ `query GetEquipment($id: ID!) {
  getEquipment(id: $id) {
    assetTag
    barcode
    calibrationDate
    category
    checkouts {
      nextToken
      __typename
    }
    condition
    createdAt
    description
    homeBase
    id
    imageKey
    insurancePolicyNumber
    insuranceValue
    kitItems {
      nextToken
      __typename
    }
    lastMaintenanceDate
    maintenanceNotes
    manufacturer
    model
    name
    nextMaintenanceDate
    organizationId
    ownershipType
    purchaseDate
    purchasePrice
    rentalRate
    replacementValue
    serialNumber
    specifications
    status
    storageLocation
    subcategory
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetEquipmentQueryVariables,
  APITypes.GetEquipmentQuery
>;
export const getEquipmentCheckout = /* GraphQL */ `query GetEquipmentCheckout($id: ID!) {
  getEquipmentCheckout(id: $id) {
    actualReturnDate
    approvedBy
    checkedOutBy
    checkedOutByName
    checkoutDate
    checkoutSignature
    conditionAtCheckout
    conditionAtReturn
    conditionNotes
    createdAt
    damageDescription
    damageReported
    equipment {
      assetTag
      barcode
      calibrationDate
      category
      condition
      createdAt
      description
      homeBase
      id
      imageKey
      insurancePolicyNumber
      insuranceValue
      lastMaintenanceDate
      maintenanceNotes
      manufacturer
      model
      name
      nextMaintenanceDate
      organizationId
      ownershipType
      purchaseDate
      purchasePrice
      rentalRate
      replacementValue
      serialNumber
      specifications
      status
      storageLocation
      subcategory
      updatedAt
      __typename
    }
    equipmentId
    expectedReturnDate
    id
    organizationId
    projectId
    purpose
    returnSignature
    returnedBy
    shootLocation
    status
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetEquipmentCheckoutQueryVariables,
  APITypes.GetEquipmentCheckoutQuery
>;
export const getEquipmentKit = /* GraphQL */ `query GetEquipmentKit($id: ID!) {
  getEquipmentKit(id: $id) {
    category
    createdAt
    description
    id
    isActive
    isTemplate
    itemCount
    kitContents {
      nextToken
      __typename
    }
    name
    organizationId
    totalValue
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetEquipmentKitQueryVariables,
  APITypes.GetEquipmentKitQuery
>;
export const getEquipmentKitItem = /* GraphQL */ `query GetEquipmentKitItem($id: ID!) {
  getEquipmentKitItem(id: $id) {
    createdAt
    equipment {
      assetTag
      barcode
      calibrationDate
      category
      condition
      createdAt
      description
      homeBase
      id
      imageKey
      insurancePolicyNumber
      insuranceValue
      lastMaintenanceDate
      maintenanceNotes
      manufacturer
      model
      name
      nextMaintenanceDate
      organizationId
      ownershipType
      purchaseDate
      purchasePrice
      rentalRate
      replacementValue
      serialNumber
      specifications
      status
      storageLocation
      subcategory
      updatedAt
      __typename
    }
    equipmentId
    id
    isRequired
    kit {
      category
      createdAt
      description
      id
      isActive
      isTemplate
      itemCount
      name
      organizationId
      totalValue
      updatedAt
      __typename
    }
    kitId
    notes
    quantity
    sortOrder
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetEquipmentKitItemQueryVariables,
  APITypes.GetEquipmentKitItemQuery
>;
export const getEquipmentRental = /* GraphQL */ `query GetEquipmentRental($id: ID!) {
  getEquipmentRental(id: $id) {
    contractKey
    createdAt
    createdBy
    createdByEmail
    dailyRate
    damageCost
    damageNotes
    deliveryFee
    depositAmount
    depositPaid
    depositPaidDate
    description
    discountAmount
    equipmentCategory
    equipmentId
    equipmentName
    id
    insuranceCost
    insuranceRate
    invoiceKey
    invoiceNumber
    lateFee
    monthlyRate
    notes
    organizationId
    paymentDate
    paymentMethod
    paymentReference
    paymentStatus
    pickupDate
    pickupFee
    projectId
    purchaseOrderNumber
    quantity
    quoteNumber
    rentalDays
    rentalEndDate
    rentalStartDate
    returnCondition
    returnDate
    serialNumber
    status
    subtotal
    taxAmount
    totalCost
    updatedAt
    usageByDay
    vendorAddress
    vendorContact
    vendorEmail
    vendorName
    vendorPhone
    weeklyRate
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetEquipmentRentalQueryVariables,
  APITypes.GetEquipmentRentalQuery
>;
export const getExpense = /* GraphQL */ `query GetExpense($id: ID!) {
  getExpense(id: $id) {
    amount
    approvedAt
    approvedBy
    budgetLineItemId
    category
    createdAt
    createdBy
    createdByEmail
    currency
    description
    exchangeRate
    expenseDate
    hasReceipt
    id
    invoiceDate
    invoiceNumber
    isReimbursement
    notes
    organizationId
    paymentDate
    paymentMethod
    paymentReference
    paymentStatus
    phase
    projectId
    receiptFileName
    receiptKey
    reimburseTo
    reimburseToName
    reimbursementStatus
    rejectionReason
    shootDay
    status
    subcategory
    submittedAt
    submittedBy
    updatedAt
    vendorId
    vendorName
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetExpenseQueryVariables,
  APITypes.GetExpenseQuery
>;
export const getInvoice = /* GraphQL */ `query GetInvoice($id: ID!) {
  getInvoice(id: $id) {
    billingPeriod
    createdAt
    currency
    discount
    dueDate
    hostedInvoiceUrl
    id
    invoiceNumber
    invoicePdfUrl
    lineItems
    notes
    organization {
      address
      autoArchiveDays
      billingCycleDay
      brandAccentColor
      brandPrimaryColor
      brandSecondaryColor
      city
      country
      createdAt
      createdBy
      currency
      currentAICreditsUsed
      currentProjectCount
      currentStorageUsedGB
      currentUserCount
      customDomain
      customFeatures
      dataProcessingAgreementSigned
      dataRetentionDays
      deletedAt
      description
      dpaSignedAt
      email
      emailFromAddress
      emailFromName
      featuresEnabled
      id
      industry
      ipWhitelist
      isGDPRCompliant
      isHIPAACompliant
      isSOC2Compliant
      locale
      logo
      maxAICredits
      maxProjects
      maxStorageGB
      maxUsers
      mfaRequired
      name
      onboardingCompleted
      onboardingCompletedAt
      onboardingStep
      owner
      phone
      postalCode
      sessionTimeoutMinutes
      slug
      ssoConfig
      ssoEnabled
      ssoProvider
      state
      status
      stripeCustomerId
      stripePaymentMethodId
      stripePriceId
      stripeSubscriptionId
      subscriptionEndsAt
      subscriptionStartedAt
      subscriptionStatus
      subscriptionTier
      suspendedAt
      suspendedReason
      timezone
      trialEndsAt
      updatedAt
      usageResetDate
      website
      __typename
    }
    organizationId
    paidAt
    paymentMethod
    periodEnd
    periodStart
    status
    stripeInvoiceId
    subtotal
    tax
    total
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetInvoiceQueryVariables,
  APITypes.GetInvoiceQuery
>;
export const getLocationCost = /* GraphQL */ `query GetLocationCost($id: ID!) {
  getLocationCost(id: $id) {
    callSheetId
    cancellationFee
    cateringFee
    cleaningFee
    contactEmail
    contactName
    contactPhone
    contractKey
    contractSigned
    contractSignedDate
    costByDay
    createdAt
    createdBy
    createdByEmail
    dailyRate
    damageDeposit
    depositPaid
    depositPaidDate
    feeType
    halfDayRate
    holdingFee
    hourlyRate
    id
    insuranceCertKey
    insuranceFee
    invoiceKey
    locationAddress
    locationFee
    locationName
    locationType
    notes
    organizationId
    otherFees
    otherFeesDescription
    overtimeRate
    ownerName
    parkingFee
    paymentDate
    paymentMethod
    paymentReference
    paymentStatus
    permitFee
    permitKey
    powerFee
    projectId
    restrictions
    securityFee
    shootDays
    specialRequirements
    status
    subtotal
    taxAmount
    totalCost
    updatedAt
    useDays
    useEndDate
    useStartDate
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetLocationCostQueryVariables,
  APITypes.GetLocationCostQuery
>;
export const getMessage = /* GraphQL */ `query GetMessage($id: ID!) {
  getMessage(id: $id) {
    assetId
    attachmentKeys
    attachmentNames
    convertedToTask
    createdAt
    deletedAt
    editedAt
    id
    isDeleted
    isEdited
    mentionedUsers
    messageText
    messageType
    organizationId
    owner
    parentMessageId
    priority
    project {
      archiveComplete
      archiveCompletedAt
      archiveLocation
      assetsDelivered
      assetsDeliveredAt
      briefComplete
      briefCompletedAt
      budgetApproved
      budgetApprovedAt
      budgetCap
      budgetContingency
      budgetDistribution
      budgetPostProduction
      budgetPreProduction
      budgetProduction
      callSheetsReady
      callSheetsReadyAt
      clientContactEmail
      confidentiality
      contractsSigned
      contractsSignedAt
      createdAt
      creativeDirectorEmail
      deadline
      deliverablesReady
      deliverablesReadyAt
      deliveryConfirmedBy
      department
      description
      distributionDate
      executiveSponsorEmail
      fieldIntelligenceFeasibilityScore
      fieldIntelligenceHealthAlerts
      fieldIntelligenceLastUpdated
      fieldIntelligenceRiskAlerts
      fieldIntelligenceWeatherData
      finalApproved
      finalApprovedAt
      finalApprovedBy
      finalAssetId
      financeContactEmail
      fundingSource
      greenlightBlockers
      greenlightClientApproved
      greenlightClientApprovedAt
      greenlightClientApprovedBy
      greenlightClientComment
      greenlightCompletedAt
      greenlightExecutiveApproved
      greenlightExecutiveApprovedAt
      greenlightExecutiveApprovedBy
      greenlightExecutiveComment
      greenlightFinanceApproved
      greenlightFinanceApprovedAt
      greenlightFinanceApprovedBy
      greenlightFinanceComment
      greenlightLegalApproved
      greenlightLegalApprovedAt
      greenlightLegalApprovedBy
      greenlightLegalComment
      greenlightProducerApproved
      greenlightProducerApprovedAt
      greenlightProducerApprovedBy
      greenlightProducerComment
      greenlightRequirements
      id
      kickoffDate
      legalApproved
      legalApprovedAt
      legalContactEmail
      legalLockDeadline
      lifecycleState
      locationsConfirmed
      locationsConfirmedAt
      mediaIngested
      name
      organizationId
      owner
      permitsObtained
      permitsObtainedAt
      postProductionEndDate
      postProductionStartDate
      preProductionEndDate
      preProductionStartDate
      primaryKPI
      principalPhotographyComplete
      principalPhotographyCompleteAt
      priority
      producerEmail
      productionEndDate
      productionStartDate
      projectOwnerEmail
      projectType
      purchaseOrderNumber
      reviewDeadline
      roughCutAssetId
      roughCutComplete
      roughCutCompleteAt
      shootLocationCity
      shootLocationCoordinates
      shootLocationCountry
      stakeholderSignoff
      stakeholderSignoffAt
      status
      targetMetric
      teamAssigned
      updatedAt
      __typename
    }
    projectId
    readBy
    senderEmail
    senderId
    senderName
    senderRole
    taskAssignedTo
    taskDeadline
    taskId
    threadDepth
    timecode
    timecodeFormatted
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetMessageQueryVariables,
  APITypes.GetMessageQuery
>;
export const getNotification = /* GraphQL */ `query GetNotification($id: ID!) {
  getNotification(id: $id) {
    actionLabel
    actionUrl
    assetId
    assetName
    createdAt
    deliveryChannels
    emailSent
    emailSentAt
    expiresAt
    id
    isRead
    message
    messageId
    organizationId
    owner
    priority
    projectId
    projectName
    readAt
    reviewId
    senderEmail
    senderId
    senderName
    slackSent
    slackSentAt
    smsSent
    smsSentAt
    title
    type
    updatedAt
    userId
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetNotificationQueryVariables,
  APITypes.GetNotificationQuery
>;
export const getOrganization = /* GraphQL */ `query GetOrganization($id: ID!) {
  getOrganization(id: $id) {
    address
    autoArchiveDays
    billingCycleDay
    brandAccentColor
    brandPrimaryColor
    brandSecondaryColor
    city
    country
    createdAt
    createdBy
    currency
    currentAICreditsUsed
    currentProjectCount
    currentStorageUsedGB
    currentUserCount
    customDomain
    customFeatures
    dataProcessingAgreementSigned
    dataRetentionDays
    deletedAt
    description
    dpaSignedAt
    email
    emailFromAddress
    emailFromName
    featuresEnabled
    id
    industry
    invitations {
      nextToken
      __typename
    }
    invoices {
      nextToken
      __typename
    }
    ipWhitelist
    isGDPRCompliant
    isHIPAACompliant
    isSOC2Compliant
    locale
    logo
    maxAICredits
    maxProjects
    maxStorageGB
    maxUsers
    members {
      nextToken
      __typename
    }
    mfaRequired
    name
    onboardingCompleted
    onboardingCompletedAt
    onboardingStep
    owner
    phone
    postalCode
    projects {
      nextToken
      __typename
    }
    sessionTimeoutMinutes
    slug
    ssoConfig
    ssoEnabled
    ssoProvider
    state
    status
    stripeCustomerId
    stripePaymentMethodId
    stripePriceId
    stripeSubscriptionId
    subscriptionEndsAt
    subscriptionStartedAt
    subscriptionStatus
    subscriptionTier
    suspendedAt
    suspendedReason
    timezone
    trialEndsAt
    updatedAt
    usageRecords {
      nextToken
      __typename
    }
    usageResetDate
    website
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetOrganizationQueryVariables,
  APITypes.GetOrganizationQuery
>;
export const getOrganizationInvitation = /* GraphQL */ `query GetOrganizationInvitation($id: ID!) {
  getOrganizationInvitation(id: $id) {
    acceptedAt
    createdAt
    declinedAt
    email
    expiresAt
    id
    inviteToken
    invitedBy
    invitedByEmail
    lastReminderAt
    message
    organization {
      address
      autoArchiveDays
      billingCycleDay
      brandAccentColor
      brandPrimaryColor
      brandSecondaryColor
      city
      country
      createdAt
      createdBy
      currency
      currentAICreditsUsed
      currentProjectCount
      currentStorageUsedGB
      currentUserCount
      customDomain
      customFeatures
      dataProcessingAgreementSigned
      dataRetentionDays
      deletedAt
      description
      dpaSignedAt
      email
      emailFromAddress
      emailFromName
      featuresEnabled
      id
      industry
      ipWhitelist
      isGDPRCompliant
      isHIPAACompliant
      isSOC2Compliant
      locale
      logo
      maxAICredits
      maxProjects
      maxStorageGB
      maxUsers
      mfaRequired
      name
      onboardingCompleted
      onboardingCompletedAt
      onboardingStep
      owner
      phone
      postalCode
      sessionTimeoutMinutes
      slug
      ssoConfig
      ssoEnabled
      ssoProvider
      state
      status
      stripeCustomerId
      stripePaymentMethodId
      stripePriceId
      stripeSubscriptionId
      subscriptionEndsAt
      subscriptionStartedAt
      subscriptionStatus
      subscriptionTier
      suspendedAt
      suspendedReason
      timezone
      trialEndsAt
      updatedAt
      usageResetDate
      website
      __typename
    }
    organizationId
    remindersSent
    role
    status
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetOrganizationInvitationQueryVariables,
  APITypes.GetOrganizationInvitationQuery
>;
export const getOrganizationMember = /* GraphQL */ `query GetOrganizationMember($id: ID!) {
  getOrganizationMember(id: $id) {
    apiKeyId
    apiKeyLastUsed
    avatar
    createdAt
    customPermissions
    department
    email
    emailNotifications
    id
    invitedAt
    invitedBy
    joinedAt
    lastActiveAt
    name
    organization {
      address
      autoArchiveDays
      billingCycleDay
      brandAccentColor
      brandPrimaryColor
      brandSecondaryColor
      city
      country
      createdAt
      createdBy
      currency
      currentAICreditsUsed
      currentProjectCount
      currentStorageUsedGB
      currentUserCount
      customDomain
      customFeatures
      dataProcessingAgreementSigned
      dataRetentionDays
      deletedAt
      description
      dpaSignedAt
      email
      emailFromAddress
      emailFromName
      featuresEnabled
      id
      industry
      ipWhitelist
      isGDPRCompliant
      isHIPAACompliant
      isSOC2Compliant
      locale
      logo
      maxAICredits
      maxProjects
      maxStorageGB
      maxUsers
      mfaRequired
      name
      onboardingCompleted
      onboardingCompletedAt
      onboardingStep
      owner
      phone
      postalCode
      sessionTimeoutMinutes
      slug
      ssoConfig
      ssoEnabled
      ssoProvider
      state
      status
      stripeCustomerId
      stripePaymentMethodId
      stripePriceId
      stripeSubscriptionId
      subscriptionEndsAt
      subscriptionStartedAt
      subscriptionStatus
      subscriptionTier
      suspendedAt
      suspendedReason
      timezone
      trialEndsAt
      updatedAt
      usageResetDate
      website
      __typename
    }
    organizationId
    owner
    phone
    role
    slackNotifications
    slackUserId
    status
    suspendedAt
    suspendedBy
    suspendedReason
    title
    updatedAt
    userId
    weeklyDigest
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetOrganizationMemberQueryVariables,
  APITypes.GetOrganizationMemberQuery
>;
export const getProject = /* GraphQL */ `query GetProject($id: ID!) {
  getProject(id: $id) {
    activityLogs {
      nextToken
      __typename
    }
    archiveComplete
    archiveCompletedAt
    archiveLocation
    assets {
      nextToken
      __typename
    }
    assetsDelivered
    assetsDeliveredAt
    brief {
      accessibilityRequired
      aiProcessedAt
      approvedByFinance
      approvedByLegal
      approvedByProducer
      brandGuidelines
      budgetRange
      complexity
      copyrightOwnership
      covidProtocolsRequired
      createdAt
      creativeProposals
      crewRoles
      deliverables
      distributionChannels
      embargoDate
      equipmentNeeds
      estimatedDuration
      geoRights
      hasDroneRisk
      hasHazardousLocationRisk
      hasMinorRisk
      hasPublicSpaceRisk
      hasStuntRisk
      id
      inspirationReferences
      insuranceRequired
      keyMessages
      languageVersions
      locationDetails
      locationReleasesRequired
      masterFormat
      musicLicensing
      organizationId
      projectDescription
      projectId
      requiredPermits
      riskLevel
      safetyOfficerNeeded
      scenes
      scriptOrNotes
      selectedProposalId
      socialCropsRequired
      stockFootageNeeded
      subtitlesRequired
      talentOnScreen
      talentReleasesRequired
      talentVoiceOver
      targetAudience
      tone
      unionRules
      updatedAt
      usageRightsDuration
      __typename
    }
    briefComplete
    briefCompletedAt
    budgetApproved
    budgetApprovedAt
    budgetCap
    budgetContingency
    budgetDistribution
    budgetPostProduction
    budgetPreProduction
    budgetProduction
    callSheets {
      nextToken
      __typename
    }
    callSheetsReady
    callSheetsReadyAt
    clientContactEmail
    confidentiality
    contractsSigned
    contractsSignedAt
    createdAt
    creativeDirectorEmail
    deadline
    deliverablesReady
    deliverablesReadyAt
    deliveryConfirmedBy
    department
    description
    distributionDate
    executiveSponsorEmail
    fieldIntelligenceFeasibilityScore
    fieldIntelligenceHealthAlerts
    fieldIntelligenceLastUpdated
    fieldIntelligenceRiskAlerts
    fieldIntelligenceWeatherData
    finalApproved
    finalApprovedAt
    finalApprovedBy
    finalAssetId
    financeContactEmail
    fundingSource
    greenlightBlockers
    greenlightClientApproved
    greenlightClientApprovedAt
    greenlightClientApprovedBy
    greenlightClientComment
    greenlightCompletedAt
    greenlightExecutiveApproved
    greenlightExecutiveApprovedAt
    greenlightExecutiveApprovedBy
    greenlightExecutiveComment
    greenlightFinanceApproved
    greenlightFinanceApprovedAt
    greenlightFinanceApprovedBy
    greenlightFinanceComment
    greenlightLegalApproved
    greenlightLegalApprovedAt
    greenlightLegalApprovedBy
    greenlightLegalComment
    greenlightProducerApproved
    greenlightProducerApprovedAt
    greenlightProducerApprovedBy
    greenlightProducerComment
    greenlightRequirements
    id
    kickoffDate
    legalApproved
    legalApprovedAt
    legalContactEmail
    legalLockDeadline
    lifecycleState
    locationsConfirmed
    locationsConfirmedAt
    mediaIngested
    messages {
      nextToken
      __typename
    }
    name
    organization {
      address
      autoArchiveDays
      billingCycleDay
      brandAccentColor
      brandPrimaryColor
      brandSecondaryColor
      city
      country
      createdAt
      createdBy
      currency
      currentAICreditsUsed
      currentProjectCount
      currentStorageUsedGB
      currentUserCount
      customDomain
      customFeatures
      dataProcessingAgreementSigned
      dataRetentionDays
      deletedAt
      description
      dpaSignedAt
      email
      emailFromAddress
      emailFromName
      featuresEnabled
      id
      industry
      ipWhitelist
      isGDPRCompliant
      isHIPAACompliant
      isSOC2Compliant
      locale
      logo
      maxAICredits
      maxProjects
      maxStorageGB
      maxUsers
      mfaRequired
      name
      onboardingCompleted
      onboardingCompletedAt
      onboardingStep
      owner
      phone
      postalCode
      sessionTimeoutMinutes
      slug
      ssoConfig
      ssoEnabled
      ssoProvider
      state
      status
      stripeCustomerId
      stripePaymentMethodId
      stripePriceId
      stripeSubscriptionId
      subscriptionEndsAt
      subscriptionStartedAt
      subscriptionStatus
      subscriptionTier
      suspendedAt
      suspendedReason
      timezone
      trialEndsAt
      updatedAt
      usageResetDate
      website
      __typename
    }
    organizationId
    owner
    permitsObtained
    permitsObtainedAt
    postProductionEndDate
    postProductionStartDate
    preProductionEndDate
    preProductionStartDate
    primaryKPI
    principalPhotographyComplete
    principalPhotographyCompleteAt
    priority
    producerEmail
    productionEndDate
    productionStartDate
    projectOwnerEmail
    projectType
    purchaseOrderNumber
    reviewDeadline
    reviews {
      nextToken
      __typename
    }
    roughCutAssetId
    roughCutComplete
    roughCutCompleteAt
    shootLocationCity
    shootLocationCoordinates
    shootLocationCountry
    stakeholderSignoff
    stakeholderSignoffAt
    status
    targetMetric
    teamAssigned
    teamMembers {
      nextToken
      __typename
    }
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetProjectQueryVariables,
  APITypes.GetProjectQuery
>;
export const getProjectArchive = /* GraphQL */ `query GetProjectArchive($id: ID!) {
  getProjectArchive(id: $id) {
    accessCount
    aiKeyMoments
    aiLessonsLearned
    aiSummary
    approvals
    archiveReason
    archiveStatus
    archivedAt
    archivedBy
    assetGraph
    budgetSummary
    costPerDeliverable
    createdAt
    deliverables
    greenlightHistory
    id
    keyAssets
    keyAssetsMetadata
    keywords
    lastAccessedAt
    legalDetails
    legalStatus
    masterDeliverableIds
    metadataSummary
    organizationId
    productionStats
    projectId
    reconstructionManifest
    regionRestrictions
    rightsExpirations
    roiCalculated
    searchEmbedding
    themes
    timelinePhases
    topics
    totalCost
    updatedAt
    versionTree
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetProjectArchiveQueryVariables,
  APITypes.GetProjectArchiveQuery
>;
export const getProjectMember = /* GraphQL */ `query GetProjectMember($id: ID!) {
  getProjectMember(id: $id) {
    accessExpiresAt
    accessStartsAt
    assignedAssetIds
    assignedPhases
    assignedTaskIds
    avatar
    createdAt
    customPermissions
    email
    emailNotifications
    externalRole
    id
    invitedAt
    invitedBy
    isExternal
    joinedAt
    lastActiveAt
    name
    organizationId
    owner
    project {
      archiveComplete
      archiveCompletedAt
      archiveLocation
      assetsDelivered
      assetsDeliveredAt
      briefComplete
      briefCompletedAt
      budgetApproved
      budgetApprovedAt
      budgetCap
      budgetContingency
      budgetDistribution
      budgetPostProduction
      budgetPreProduction
      budgetProduction
      callSheetsReady
      callSheetsReadyAt
      clientContactEmail
      confidentiality
      contractsSigned
      contractsSignedAt
      createdAt
      creativeDirectorEmail
      deadline
      deliverablesReady
      deliverablesReadyAt
      deliveryConfirmedBy
      department
      description
      distributionDate
      executiveSponsorEmail
      fieldIntelligenceFeasibilityScore
      fieldIntelligenceHealthAlerts
      fieldIntelligenceLastUpdated
      fieldIntelligenceRiskAlerts
      fieldIntelligenceWeatherData
      finalApproved
      finalApprovedAt
      finalApprovedBy
      finalAssetId
      financeContactEmail
      fundingSource
      greenlightBlockers
      greenlightClientApproved
      greenlightClientApprovedAt
      greenlightClientApprovedBy
      greenlightClientComment
      greenlightCompletedAt
      greenlightExecutiveApproved
      greenlightExecutiveApprovedAt
      greenlightExecutiveApprovedBy
      greenlightExecutiveComment
      greenlightFinanceApproved
      greenlightFinanceApprovedAt
      greenlightFinanceApprovedBy
      greenlightFinanceComment
      greenlightLegalApproved
      greenlightLegalApprovedAt
      greenlightLegalApprovedBy
      greenlightLegalComment
      greenlightProducerApproved
      greenlightProducerApprovedAt
      greenlightProducerApprovedBy
      greenlightProducerComment
      greenlightRequirements
      id
      kickoffDate
      legalApproved
      legalApprovedAt
      legalContactEmail
      legalLockDeadline
      lifecycleState
      locationsConfirmed
      locationsConfirmedAt
      mediaIngested
      name
      organizationId
      owner
      permitsObtained
      permitsObtainedAt
      postProductionEndDate
      postProductionStartDate
      preProductionEndDate
      preProductionStartDate
      primaryKPI
      principalPhotographyComplete
      principalPhotographyCompleteAt
      priority
      producerEmail
      productionEndDate
      productionStartDate
      projectOwnerEmail
      projectType
      purchaseOrderNumber
      reviewDeadline
      roughCutAssetId
      roughCutComplete
      roughCutCompleteAt
      shootLocationCity
      shootLocationCoordinates
      shootLocationCountry
      stakeholderSignoff
      stakeholderSignoffAt
      status
      targetMetric
      teamAssigned
      updatedAt
      __typename
    }
    projectId
    projectRole
    revokedAt
    revokedBy
    revokedReason
    slackUserId
    status
    suspendedAt
    suspendedBy
    suspendedReason
    title
    updatedAt
    userId
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetProjectMemberQueryVariables,
  APITypes.GetProjectMemberQuery
>;
export const getProxyFile = /* GraphQL */ `query GetProxyFile($id: ID!) {
  getProxyFile(id: $id) {
    assetId
    assetVersionId
    audioBitrate
    audioCodec
    bitrate
    cdnUrl
    codec
    createdAt
    createdBy
    duration
    errorMessage
    fileSizeBytes
    frameRate
    id
    jobId
    lastViewedAt
    organizationId
    processingCompleted
    processingDuration
    processingStarted
    processor
    progress
    proxyType
    resolution
    s3Bucket
    s3Key
    status
    updatedAt
    viewCount
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetProxyFileQueryVariables,
  APITypes.GetProxyFileQuery
>;
export const getQCReport = /* GraphQL */ `query GetQCReport($id: ID!) {
  getQCReport(id: $id) {
    assetId
    audioQuality
    audioTechnical
    checkResults
    compliance
    createdAt
    createdBy
    criticalIssues
    deliverableId
    editorial
    failedChecks
    graphicsText
    id
    majorIssues
    minorIssues
    name
    organizationId
    overallStatus
    passedChecks
    projectId
    qcDate
    qcDuration
    qcOperator
    qcOperatorEmail
    reportKey
    reportType
    signOffNotes
    signedOffAt
    signedOffBy
    totalChecks
    updatedAt
    videoQuality
    videoTechnical
    warningChecks
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetQCReportQueryVariables,
  APITypes.GetQCReportQuery
>;
export const getQualityScore = /* GraphQL */ `query GetQualityScore($id: ID!) {
  getQualityScore(id: $id) {
    analysisDuration
    analysisVersion
    analyzedAt
    analyzedBy
    assetId
    assetVersionId
    audioBitrate
    audioChannels
    audioClippingDetected
    audioCodec
    audioLoudnessLUFS
    audioNoiseFloor
    audioPeakdB
    audioQualityScore
    audioSampleRate
    audioSilencePercentage
    checksumMD5
    checksumSHA256
    colorGradeConsistency
    complianceIssues
    compositionScore
    contentClarity
    corruptionDetails
    createdAt
    fileIntegrity
    formatCompliance
    grade
    id
    motionSmoothnessScore
    organizationId
    overallScore
    projectId
    recommendedFixes
    updatedAt
    videoBitDepth
    videoBitrate
    videoBitrateScore
    videoCodec
    videoColorSpace
    videoExposureScore
    videoFrameRate
    videoHDR
    videoResolution
    videoResolutionScore
    videoStabilityScore
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetQualityScoreQueryVariables,
  APITypes.GetQualityScoreQuery
>;
export const getRestoreRequest = /* GraphQL */ `query GetRestoreRequest($id: ID!) {
  getRestoreRequest(id: $id) {
    actualCost
    assetId
    completedAt
    createdAt
    errorMessage
    estimatedCompletion
    estimatedCost
    expiresAt
    id
    notificationSent
    notifyOnComplete
    organizationId
    partialEndSeconds
    partialReason
    partialStartSeconds
    projectId
    requestType
    requestedAt
    requestedBy
    requestedByEmail
    restoreDurationDays
    restoreTier
    restoredKey
    restoredSize
    status
    storageTierId
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetRestoreRequestQueryVariables,
  APITypes.GetRestoreRequestQuery
>;
export const getReview = /* GraphQL */ `query GetReview($id: ID!) {
  getReview(id: $id) {
    asset {
      aiConfidence
      aiProcessedAt
      aiTags
      approvalRequirements
      approvalState
      clientApprovalNote
      clientApproved
      clientApprovedAt
      clientApprovedBy
      createdAt
      dimensions
      duration
      fileSize
      finalApprovedAt
      finalApprovedBy
      id
      internalApprovalNote
      internalApproved
      internalApprovedAt
      internalApprovedBy
      isBRoll
      isLegalLocked
      isPlannedShot
      legalApprovalNote
      legalApproved
      legalApprovedAt
      legalApprovedBy
      legalLockedAt
      mimeType
      organizationId
      owner
      projectId
      s3Key
      shotDescription
      shotListItemId
      storageClass
      thumbnailKey
      type
      updatedAt
      usageHeatmap
      version
      __typename
    }
    assetId
    comments {
      nextToken
      __typename
    }
    createdAt
    id
    isLegalApproved
    legalApprovedAt
    legalApprovedBy
    organizationId
    owner
    project {
      archiveComplete
      archiveCompletedAt
      archiveLocation
      assetsDelivered
      assetsDeliveredAt
      briefComplete
      briefCompletedAt
      budgetApproved
      budgetApprovedAt
      budgetCap
      budgetContingency
      budgetDistribution
      budgetPostProduction
      budgetPreProduction
      budgetProduction
      callSheetsReady
      callSheetsReadyAt
      clientContactEmail
      confidentiality
      contractsSigned
      contractsSignedAt
      createdAt
      creativeDirectorEmail
      deadline
      deliverablesReady
      deliverablesReadyAt
      deliveryConfirmedBy
      department
      description
      distributionDate
      executiveSponsorEmail
      fieldIntelligenceFeasibilityScore
      fieldIntelligenceHealthAlerts
      fieldIntelligenceLastUpdated
      fieldIntelligenceRiskAlerts
      fieldIntelligenceWeatherData
      finalApproved
      finalApprovedAt
      finalApprovedBy
      finalAssetId
      financeContactEmail
      fundingSource
      greenlightBlockers
      greenlightClientApproved
      greenlightClientApprovedAt
      greenlightClientApprovedBy
      greenlightClientComment
      greenlightCompletedAt
      greenlightExecutiveApproved
      greenlightExecutiveApprovedAt
      greenlightExecutiveApprovedBy
      greenlightExecutiveComment
      greenlightFinanceApproved
      greenlightFinanceApprovedAt
      greenlightFinanceApprovedBy
      greenlightFinanceComment
      greenlightLegalApproved
      greenlightLegalApprovedAt
      greenlightLegalApprovedBy
      greenlightLegalComment
      greenlightProducerApproved
      greenlightProducerApprovedAt
      greenlightProducerApprovedBy
      greenlightProducerComment
      greenlightRequirements
      id
      kickoffDate
      legalApproved
      legalApprovedAt
      legalContactEmail
      legalLockDeadline
      lifecycleState
      locationsConfirmed
      locationsConfirmedAt
      mediaIngested
      name
      organizationId
      owner
      permitsObtained
      permitsObtainedAt
      postProductionEndDate
      postProductionStartDate
      preProductionEndDate
      preProductionStartDate
      primaryKPI
      principalPhotographyComplete
      principalPhotographyCompleteAt
      priority
      producerEmail
      productionEndDate
      productionStartDate
      projectOwnerEmail
      projectType
      purchaseOrderNumber
      reviewDeadline
      roughCutAssetId
      roughCutComplete
      roughCutCompleteAt
      shootLocationCity
      shootLocationCoordinates
      shootLocationCountry
      stakeholderSignoff
      stakeholderSignoffAt
      status
      targetMetric
      teamAssigned
      updatedAt
      __typename
    }
    projectId
    reviewerEmail
    reviewerId
    reviewerRole
    status
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetReviewQueryVariables, APITypes.GetReviewQuery>;
export const getReviewComment = /* GraphQL */ `query GetReviewComment($id: ID!) {
  getReviewComment(id: $id) {
    assetId
    attachmentKeys
    commentText
    commentType
    commenterEmail
    commenterId
    commenterRole
    createdAt
    id
    isResolved
    linkedAssetVersionId
    linkedTaskId
    linkedTaskStatus
    organizationId
    owner
    priority
    projectId
    replies {
      nextToken
      __typename
    }
    resolvedAt
    resolvedBy
    resolvedByEmail
    resolvedInAssetVersionId
    review {
      assetId
      createdAt
      id
      isLegalApproved
      legalApprovedAt
      legalApprovedBy
      organizationId
      owner
      projectId
      reviewerEmail
      reviewerId
      reviewerRole
      status
      updatedAt
      __typename
    }
    reviewId
    timecode
    timecodeFormatted
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetReviewCommentQueryVariables,
  APITypes.GetReviewCommentQuery
>;
export const getReviewCommentReply = /* GraphQL */ `query GetReviewCommentReply($id: ID!) {
  getReviewCommentReply(id: $id) {
    createdAt
    id
    owner
    parentComment {
      assetId
      attachmentKeys
      commentText
      commentType
      commenterEmail
      commenterId
      commenterRole
      createdAt
      id
      isResolved
      linkedAssetVersionId
      linkedTaskId
      linkedTaskStatus
      organizationId
      owner
      priority
      projectId
      resolvedAt
      resolvedBy
      resolvedByEmail
      resolvedInAssetVersionId
      reviewId
      timecode
      timecodeFormatted
      updatedAt
      __typename
    }
    parentCommentId
    replierEmail
    replierId
    replierRole
    replyText
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetReviewCommentReplyQueryVariables,
  APITypes.GetReviewCommentReplyQuery
>;
export const getRightsDocument = /* GraphQL */ `query GetRightsDocument($id: ID!) {
  getRightsDocument(id: $id) {
    approvalDate
    approvedBy
    approvedByName
    coverageAmount
    coverageType
    createdAt
    description
    documentNumber
    documentType
    effectiveDate
    expirationDate
    fileKey
    fileName
    fileSize
    id
    isCritical
    isLatestVersion
    isRequired
    issueDate
    issuingAuthority
    jurisdiction
    lastReminderSent
    locationAddress
    locationName
    mimeType
    name
    notes
    organizationId
    personEmail
    personName
    personRole
    previousVersionId
    projectId
    rejectionReason
    reminderDays
    renewalDate
    restrictions
    reviewDate
    reviewedBy
    reviewedByName
    shootDay
    status
    tags
    thumbnailKey
    updatedAt
    uploadedBy
    uploadedByName
    version
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetRightsDocumentQueryVariables,
  APITypes.GetRightsDocumentQuery
>;
export const getSavedSearch = /* GraphQL */ `query GetSavedSearch($id: ID!) {
  getSavedSearch(id: $id) {
    color
    createdAt
    createdBy
    createdByEmail
    description
    displayOrder
    filters
    icon
    id
    isPinned
    lastModifiedAt
    lastModifiedBy
    lastNotifiedAt
    lastUsedAt
    name
    notifyEmail
    notifyOnNewMatches
    organizationId
    projectId
    scope
    searchQuery
    sharedWith
    sortBy
    sortOrder
    updatedAt
    usageCount
    visibility
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetSavedSearchQueryVariables,
  APITypes.GetSavedSearchQuery
>;
export const getShareLink = /* GraphQL */ `query GetShareLink($id: ID!) {
  getShareLink(id: $id) {
    accessLog
    allowComment
    allowDownload
    allowPreview
    allowedDomains
    allowedEmails
    createdAt
    createdBy
    createdByEmail
    deactivatedAt
    deactivatedBy
    deactivationReason
    downloadCount
    downloadQuality
    expiresAt
    id
    isActive
    lastAccessedAt
    lastAccessedBy
    maxDownloads
    maxViews
    name
    notifyEmail
    notifyOnAccess
    organizationId
    password
    requiresPassword
    shareType
    targetIds
    token
    updatedAt
    viewCount
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetShareLinkQueryVariables,
  APITypes.GetShareLinkQuery
>;
export const getShotListTracker = /* GraphQL */ `query GetShotListTracker($id: ID!) {
  getShotListTracker(id: $id) {
    briefId
    callSheetId
    captureStatus
    capturedAssetIds
    capturedAt
    capturedBy
    continuityNotes
    createdAt
    directorApproved
    directorApprovedAt
    dpApproved
    dpApprovedAt
    framing
    id
    movement
    notes
    organizationId
    plannedDuration
    projectId
    propNotes
    proposalId
    qualityNotes
    qualityRating
    selectedAssetId
    shootDay
    shotDescription
    shotNumber
    shotType
    takeCount
    updatedAt
    wardrobeNotes
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetShotListTrackerQueryVariables,
  APITypes.GetShotListTrackerQuery
>;
export const getShotLog = /* GraphQL */ `query GetShotLog($id: ID!) {
  getShotLog(id: $id) {
    camera
    cardId
    circled
    continuityNotes
    createdAt
    dprId
    duration
    fStop
    fps
    id
    iso
    lens
    loggedBy
    loggedByEmail
    notes
    organizationId
    performanceNotes
    projectId
    scene
    shot
    status
    take
    technicalNotes
    timecodeIn
    timecodeOut
    timestamp
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetShotLogQueryVariables,
  APITypes.GetShotLogQuery
>;
export const getSocialOutput = /* GraphQL */ `query GetSocialOutput($id: ID!) {
  getSocialOutput(id: $id) {
    addEndCard
    addWatermark
    aspectRatio
    audioTrack
    captionFileKey
    captionLanguage
    captionStyle
    cmsEndpoint
    cmsIntegration
    cmsPublishStatus
    cmsPublishedAt
    cmsPublishedUrl
    createdAt
    createdBy
    createdByEmail
    cropPosition
    cropX
    cropY
    customHeight
    customWidth
    description
    endCardDuration
    endCardKey
    id
    includeCaptions
    includeSubtitles
    isScheduled
    maxDuration
    name
    normalizeAudio
    organizationId
    outputBitrate
    outputCodec
    outputDuration
    outputFileKey
    outputFileSize
    outputFormat
    outputResolution
    platform
    postCallToAction
    postCallToActionUrl
    postCaption
    postCategory
    postDescription
    postHashtags
    postLocation
    postMentions
    postPrivacy
    postTags
    postThumbnailKey
    postTitle
    processingCompletedAt
    processingError
    processingProgress
    processingStartedAt
    projectId
    scheduledPublishAt
    socialPostId
    socialPublishError
    socialPublishStatus
    socialPublishedAt
    socialPublishedUrl
    sourceAssetId
    sourceVersionId
    status
    subtitleLanguages
    targetLoudness
    trimEnd
    trimStart
    updatedAt
    watermarkKey
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetSocialOutputQueryVariables,
  APITypes.GetSocialOutputQuery
>;
export const getStorageTier = /* GraphQL */ `query GetStorageTier($id: ID!) {
  getStorageTier(id: $id) {
    archiveReason
    archivedAt
    archivedBy
    assetId
    createdAt
    currentStorageClass
    fileSizeBytes
    id
    isArchived
    isRestoring
    lastChecked
    lastCostCalculation
    lastRestoredAt
    lifecyclePolicyApplied
    monthlyStorageCost
    nextTransitionClass
    nextTransitionDate
    organizationId
    originalStorageClass
    partialRestoreExpiresAt
    partialRestoreKey
    partialRestoreRanges
    projectId
    projectedAnnualCost
    restoreCount
    restoreExpiresAt
    restoreRequestedAt
    restoreRequestedBy
    restoreType
    s3Bucket
    s3Key
    totalStorageCostToDate
    transitionHistory
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetStorageTierQueryVariables,
  APITypes.GetStorageTierQuery
>;
export const getSubscriptionPlan = /* GraphQL */ `query GetSubscriptionPlan($id: ID!) {
  getSubscriptionPlan(id: $id) {
    annualPrice
    createdAt
    currency
    description
    features
    featuresDescription
    id
    isActive
    isPopular
    isPublic
    maxAICreditsPerMonth
    maxBandwidthGB
    maxProjects
    maxStorageGB
    maxUsers
    monthlyPrice
    name
    slug
    sortOrder
    stripePriceIdAnnual
    stripePriceIdMonthly
    tier
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetSubscriptionPlanQueryVariables,
  APITypes.GetSubscriptionPlanQuery
>;
export const getTask = /* GraphQL */ `query GetTask($id: ID!) {
  getTask(id: $id) {
    actualHours
    assignedAt
    assignedBy
    assignedByEmail
    assignedToEmail
    assignedToName
    attachmentKeys
    blockedBy
    blockedReason
    completedAt
    completedBy
    completedByEmail
    createdAt
    createdBy
    createdByEmail
    dependsOn
    description
    dueDate
    estimatedHours
    id
    linkedAssetId
    linkedAssetName
    linkedTimecode
    linkedTimecodeFormatted
    organizationId
    priority
    progressPercentage
    projectId
    resolutionNote
    resolvedInAssetVersionId
    resolvedInAssetVersionNumber
    sourceAssetId
    sourceCommentId
    sourceMessageId
    startDate
    status
    tags
    taskType
    title
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetTaskQueryVariables, APITypes.GetTaskQuery>;
export const getTeamMember = /* GraphQL */ `query GetTeamMember($id: ID!) {
  getTeamMember(id: $id) {
    acceptedAt
    avatar
    company
    contributionCount
    createdAt
    customRoleTitle
    department
    email
    id
    invitedAt
    invitedBy
    lastActiveAt
    name
    notifyOnApprovals
    notifyOnAssets
    notifyOnMessages
    notifyOnTasks
    organizationId
    permissions
    phone
    projectId
    removalReason
    removedAt
    removedBy
    role
    status
    title
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetTeamMemberQueryVariables,
  APITypes.GetTeamMemberQuery
>;
export const getTranscription = /* GraphQL */ `query GetTranscription($id: ID!) {
  getTranscription(id: $id) {
    assetId
    assetVersionId
    averageConfidence
    completedAt
    createdAt
    createdBy
    errorMessage
    fullText
    hasManualEdits
    id
    jobId
    keywords
    language
    languageConfidence
    lastEditedAt
    lastEditedBy
    lowConfidenceSegments
    organizationId
    progress
    provider
    segments
    speakerCount
    speakers
    srtKey
    status
    transcriptKey
    updatedAt
    vttKey
    wordCount
    words
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetTranscriptionQueryVariables,
  APITypes.GetTranscriptionQuery
>;
export const getUsageRecord = /* GraphQL */ `query GetUsageRecord($id: ID!) {
  getUsageRecord(id: $id) {
    billingPeriod
    createdAt
    currency
    description
    id
    includedQuantity
    organization {
      address
      autoArchiveDays
      billingCycleDay
      brandAccentColor
      brandPrimaryColor
      brandSecondaryColor
      city
      country
      createdAt
      createdBy
      currency
      currentAICreditsUsed
      currentProjectCount
      currentStorageUsedGB
      currentUserCount
      customDomain
      customFeatures
      dataProcessingAgreementSigned
      dataRetentionDays
      deletedAt
      description
      dpaSignedAt
      email
      emailFromAddress
      emailFromName
      featuresEnabled
      id
      industry
      ipWhitelist
      isGDPRCompliant
      isHIPAACompliant
      isSOC2Compliant
      locale
      logo
      maxAICredits
      maxProjects
      maxStorageGB
      maxUsers
      mfaRequired
      name
      onboardingCompleted
      onboardingCompletedAt
      onboardingStep
      owner
      phone
      postalCode
      sessionTimeoutMinutes
      slug
      ssoConfig
      ssoEnabled
      ssoProvider
      state
      status
      stripeCustomerId
      stripePaymentMethodId
      stripePriceId
      stripeSubscriptionId
      subscriptionEndsAt
      subscriptionStartedAt
      subscriptionStatus
      subscriptionTier
      suspendedAt
      suspendedReason
      timezone
      trialEndsAt
      updatedAt
      usageResetDate
      website
      __typename
    }
    organizationId
    overageCost
    overageQuantity
    periodEnd
    periodStart
    projectId
    quantity
    totalCost
    unit
    unitPrice
    updatedAt
    usageType
    userId
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetUsageRecordQueryVariables,
  APITypes.GetUsageRecordQuery
>;
export const getVFXShot = /* GraphQL */ `query GetVFXShot($id: ID!) {
  getVFXShot(id: $id) {
    actualAmount
    bidAmount
    briefKey
    complexity
    createdAt
    createdBy
    currentVersion
    deliveryStage
    description
    dueDate
    frameCount
    frameIn
    frameOut
    id
    latestDeliveryKey
    notes
    organizationId
    plateDelivered
    plateDeliveredAt
    plateKey
    projectId
    referenceDelivered
    referenceDeliveredAt
    sequence
    shotCode
    status
    updatedAt
    variance
    vendor
    vendorContact
    vendorEmail
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetVFXShotQueryVariables,
  APITypes.GetVFXShotQuery
>;
export const getWorkflowExecutionLog = /* GraphQL */ `query GetWorkflowExecutionLog($id: ID!) {
  getWorkflowExecutionLog(id: $id) {
    actionResults
    assetIds
    assetsFailed
    assetsProcessed
    assetsSucceeded
    completedAt
    createdAt
    durationMs
    errorDetails
    errorMessage
    executionLog
    id
    organizationId
    startedAt
    status
    triggerEvent
    triggeredBy
    triggeredByUser
    updatedAt
    workflowRuleId
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetWorkflowExecutionLogQueryVariables,
  APITypes.GetWorkflowExecutionLogQuery
>;
export const getWorkflowRule = /* GraphQL */ `query GetWorkflowRule($id: ID!) {
  getWorkflowRule(id: $id) {
    actions
    createdAt
    createdBy
    description
    failedExecutions
    id
    isActive
    lastExecutionAt
    lastExecutionLog
    lastExecutionStatus
    lastModifiedAt
    lastModifiedBy
    lastRunAt
    name
    nextRunAt
    organizationId
    priority
    projectId
    schedule
    scope
    successfulExecutions
    totalExecutions
    triggerConditions
    triggerType
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetWorkflowRuleQueryVariables,
  APITypes.GetWorkflowRuleQuery
>;
export const listAIAnalysisJobs = /* GraphQL */ `query ListAIAnalysisJobs(
  $filter: ModelAIAnalysisJobFilterInput
  $limit: Int
  $nextToken: String
) {
  listAIAnalysisJobs(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      analysisType
      assetId
      assetName
      assetVersionId
      assetVersionNumber
      completedAt
      createdAt
      errorMessage
      id
      organizationId
      progress
      projectId
      queuedAt
      rekognitionJobId
      resultsCount
      resultsSnapshot
      s3KeyAtAnalysis
      startedAt
      status
      transcribeJobName
      triggeredBy
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAIAnalysisJobsQueryVariables,
  APITypes.ListAIAnalysisJobsQuery
>;
export const listAIFaceDetections = /* GraphQL */ `query ListAIFaceDetections(
  $filter: ModelAIFaceDetectionFilterInput
  $limit: Int
  $nextToken: String
) {
  listAIFaceDetections(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      ageRange
      assetId
      beard
      boundingBox
      confidence
      createdAt
      emotions
      eyeglasses
      eyesOpen
      gender
      id
      landmarks
      mouthOpen
      mustache
      organizationId
      personId
      personName
      processingJobId
      projectId
      smile
      sunglasses
      timestamp
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAIFaceDetectionsQueryVariables,
  APITypes.ListAIFaceDetectionsQuery
>;
export const listAISceneDetections = /* GraphQL */ `query ListAISceneDetections(
  $filter: ModelAISceneDetectionFilterInput
  $limit: Int
  $nextToken: String
) {
  listAISceneDetections(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      assetId
      confidence
      createdAt
      duration
      endTime
      id
      labels
      lighting
      movement
      organizationId
      processingJobId
      projectId
      shotType
      startTime
      thumbnailKey
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAISceneDetectionsQueryVariables,
  APITypes.ListAISceneDetectionsQuery
>;
export const listAITranscripts = /* GraphQL */ `query ListAITranscripts(
  $filter: ModelAITranscriptFilterInput
  $limit: Int
  $nextToken: String
) {
  listAITranscripts(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      assetId
      confidence
      createdAt
      endTime
      id
      languageCode
      organizationId
      processingJobId
      projectId
      speakerId
      speakerName
      startTime
      text
      updatedAt
      words
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAITranscriptsQueryVariables,
  APITypes.ListAITranscriptsQuery
>;
export const listAccessExceptions = /* GraphQL */ `query ListAccessExceptions(
  $filter: ModelAccessExceptionFilterInput
  $limit: Int
  $nextToken: String
) {
  listAccessExceptions(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      approvedAt
      approvedBy
      approvedByEmail
      approverRole
      createdAt
      denialReason
      durationHours
      expiresAt
      id
      organizationId
      owner
      projectId
      reason
      requestedAction
      requestedAssetId
      requestedAt
      requestedBy
      requestedByEmail
      status
      targetUserEmail
      targetUserId
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAccessExceptionsQueryVariables,
  APITypes.ListAccessExceptionsQuery
>;
export const listActivityLogs = /* GraphQL */ `query ListActivityLogs(
  $filter: ModelActivityLogFilterInput
  $limit: Int
  $nextToken: String
) {
  listActivityLogs(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      action
      createdAt
      id
      ipAddress
      metadata
      organizationId
      projectId
      targetId
      targetName
      targetType
      updatedAt
      userEmail
      userId
      userRole
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListActivityLogsQueryVariables,
  APITypes.ListActivityLogsQuery
>;
export const listArchiveAssets = /* GraphQL */ `query ListArchiveAssets(
  $filter: ModelArchiveAssetFilterInput
  $limit: Int
  $nextToken: String
) {
  listArchiveAssets(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      aiEmotions
      aiFaces
      aiObjects
      aiSceneDescription
      aiSentiment
      aiSummary
      aiTextOnScreen
      aiTranscript
      aspectRatio
      assetId
      audioChannels
      audioCodec
      audioSampleRate
      bitDepth
      bitrate
      camera
      cameraSettings
      childAssetIds
      codec
      colorPalette
      colorSpace
      createdAt
      creativeMetadata
      duration
      fileSizeBytes
      frameRate
      fullTextIndex
      glacierArchiveId
      glacierVaultId
      hdr
      id
      labels
      lastTierChangeAt
      lastUsedAt
      lastUsedBy
      legalMetadata
      lens
      linkedProjects
      linkedVersions
      locationReleases
      mood
      operationalMetadata
      organizationId
      parentAssetId
      partialRetrievalSupported
      permitExpiry
      permitId
      projectId
      proxyKey
      regionRestrictions
      releaseStatus
      resolution
      rightsExpiration
      riskFactors
      riskScore
      s3Bucket
      s3Key
      sceneNumber
      searchVector
      shotType
      storageMetadata
      storageTier
      subjects
      takeNumber
      talentReleases
      technicalMetadata
      thawCostEstimate
      thumbnailKey
      tierChangeHistory
      transcriptKeywords
      updatedAt
      uploadTimestamp
      uploaderEmail
      uploaderName
      usageCount
      usageRestrictions
      visualStyle
      waveformKey
      workflowStage
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListArchiveAssetsQueryVariables,
  APITypes.ListArchiveAssetsQuery
>;
export const listArchivePolicies = /* GraphQL */ `query ListArchivePolicies(
  $filter: ModelArchivePolicyFilterInput
  $limit: Int
  $nextToken: String
) {
  listArchivePolicies(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      assetsProcessed
      createdAt
      createdBy
      createdByEmail
      daysUntilArchive
      description
      excludeAssetTypes
      excludeTaggedWith
      id
      includeAssetTypes
      isEnabled
      lastExecutedAt
      minFileSizeMB
      name
      nextScheduledRun
      onlyProjectStatus
      organizationId
      projectId
      storageFreedGB
      targetStorageClass
      triggerType
      updatedAt
      usageScoreThreshold
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListArchivePoliciesQueryVariables,
  APITypes.ListArchivePoliciesQuery
>;
export const listAssetAnalytics = /* GraphQL */ `query ListAssetAnalytics(
  $filter: ModelAssetAnalyticsFilterInput
  $limit: Int
  $nextToken: String
) {
  listAssetAnalytics(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      approvalCount
      assetId
      averageRating
      averageWatchPercentage
      commentCount
      createdAt
      dataIntegrity
      distributionLinksCreated
      downloadCount
      estimatedValue
      externalEmbeds
      feedbackSentiment
      firstViewedAt
      id
      lastUpdated
      lastViewedAt
      organizationId
      peakUsageCount
      peakUsageDate
      productionCost
      projectId
      revenueGenerated
      revisionRequestCount
      roiLastCalculated
      roiPercentage
      shareCount
      socialOutputsCreated
      totalPlayDuration
      totalViews
      uniqueViewers
      updatedAt
      usageScore
      usageScoreUpdatedAt
      usageTrend
      viewerDevices
      viewerLocations
      viewsByDay
      viewsByHour
      viewsByMonth
      viewsByWeek
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAssetAnalyticsQueryVariables,
  APITypes.ListAssetAnalyticsQuery
>;
export const listAssetLineages = /* GraphQL */ `query ListAssetLineages(
  $filter: ModelAssetLineageFilterInput
  $limit: Int
  $nextToken: String
) {
  listAssetLineages(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      approvals
      approvedAt
      approvedBy
      childAssets
      createdAt
      currentVersion
      derivationDetails
      derivationType
      generationNumber
      id
      inheritedMetadata
      isApproved
      lastUsedAt
      masterAssetId
      masterAssetName
      masterProjectId
      organizationId
      overriddenMetadata
      updatedAt
      usageCount
      usedInDeliverables
      usedInProjects
      versionHistory
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAssetLineagesQueryVariables,
  APITypes.ListAssetLineagesQuery
>;
export const listAssetUsageHeatmaps = /* GraphQL */ `query ListAssetUsageHeatmaps(
  $filter: ModelAssetUsageHeatmapFilterInput
  $limit: Int
  $nextToken: String
) {
  listAssetUsageHeatmaps(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      archiveRecommendation
      archiveRecommendationReason
      assetId
      createdAt
      dataQuality
      deliverableCount
      engagementRate
      estimatedImpressions
      estimatedRevenueGenerated
      id
      lastCalculated
      lastUsed
      organizationId
      peakUsageCount
      peakUsageDate
      platformUsage
      predictedUsageNext30Days
      productionCost
      projectId
      recommendedStorageTier
      relatedDeliverables
      reusabilityScore
      roiScore
      strategicValue
      topUsers
      trendAnalysis
      uniquenessScore
      updatedAt
      usageByDayOfWeek
      usageByHour
      usageByMonth
      usageByWeek
      usageTrend
      useByRole
      useByTeam
      useByUser
      useFrequencyDaily
      useFrequencyMonthly
      useFrequencyWeekly
      valueJustification
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAssetUsageHeatmapsQueryVariables,
  APITypes.ListAssetUsageHeatmapsQuery
>;
export const listAssetVersions = /* GraphQL */ `query ListAssetVersions(
  $filter: ModelAssetVersionFilterInput
  $limit: Int
  $nextToken: String
) {
  listAssetVersions(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      assetId
      changeDescription
      createdAt
      createdBy
      createdByEmail
      fileSize
      id
      isCurrentVersion
      isReviewReady
      mimeType
      organizationId
      previousVersionId
      projectId
      s3Key
      updatedAt
      versionLabel
      versionNumber
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAssetVersionsQueryVariables,
  APITypes.ListAssetVersionsQuery
>;
export const listAssets = /* GraphQL */ `query ListAssets(
  $filter: ModelAssetFilterInput
  $limit: Int
  $nextToken: String
) {
  listAssets(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      aiConfidence
      aiProcessedAt
      aiTags
      approvalRequirements
      approvalState
      clientApprovalNote
      clientApproved
      clientApprovedAt
      clientApprovedBy
      createdAt
      dimensions
      duration
      fileSize
      finalApprovedAt
      finalApprovedBy
      id
      internalApprovalNote
      internalApproved
      internalApprovedAt
      internalApprovedBy
      isBRoll
      isLegalLocked
      isPlannedShot
      legalApprovalNote
      legalApproved
      legalApprovedAt
      legalApprovedBy
      legalLockedAt
      mimeType
      organizationId
      owner
      projectId
      s3Key
      shotDescription
      shotListItemId
      storageClass
      thumbnailKey
      type
      updatedAt
      usageHeatmap
      version
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAssetsQueryVariables,
  APITypes.ListAssetsQuery
>;
export const listAudioCues = /* GraphQL */ `query ListAudioCues(
  $filter: ModelAudioCueFilterInput
  $limit: Int
  $nextToken: String
) {
  listAudioCues(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      actor
      character
      clearanceDate
      clearanceNotes
      clearanceStatus
      composer
      createdAt
      createdBy
      cueNumber
      cueType
      duration
      editedKey
      id
      licenseFee
      lineText
      masterOwner
      name
      notes
      organizationId
      projectId
      publisher
      recordingDate
      recordingFacility
      recordingStatus
      sourceKey
      syncOwner
      term
      territories
      timecodeIn
      timecodeOut
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAudioCuesQueryVariables,
  APITypes.ListAudioCuesQuery
>;
export const listAuditLogs = /* GraphQL */ `query ListAuditLogs(
  $filter: ModelAuditLogFilterInput
  $limit: Int
  $nextToken: String
) {
  listAuditLogs(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      action
      actionCategory
      assetId
      createdAt
      deniedReason
      details
      geoLocation
      id
      ipAddress
      isExternal
      organizationId
      projectId
      resourceId
      resourceType
      sessionId
      success
      timestamp
      updatedAt
      userAgent
      userEmail
      userId
      userRole
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListAuditLogsQueryVariables,
  APITypes.ListAuditLogsQuery
>;
export const listBriefs = /* GraphQL */ `query ListBriefs(
  $filter: ModelBriefFilterInput
  $limit: Int
  $nextToken: String
) {
  listBriefs(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      accessibilityRequired
      aiProcessedAt
      approvedByFinance
      approvedByLegal
      approvedByProducer
      brandGuidelines
      budgetRange
      complexity
      copyrightOwnership
      covidProtocolsRequired
      createdAt
      creativeProposals
      crewRoles
      deliverables
      distributionChannels
      embargoDate
      equipmentNeeds
      estimatedDuration
      geoRights
      hasDroneRisk
      hasHazardousLocationRisk
      hasMinorRisk
      hasPublicSpaceRisk
      hasStuntRisk
      id
      inspirationReferences
      insuranceRequired
      keyMessages
      languageVersions
      locationDetails
      locationReleasesRequired
      masterFormat
      musicLicensing
      organizationId
      projectDescription
      projectId
      requiredPermits
      riskLevel
      safetyOfficerNeeded
      scenes
      scriptOrNotes
      selectedProposalId
      socialCropsRequired
      stockFootageNeeded
      subtitlesRequired
      talentOnScreen
      talentReleasesRequired
      talentVoiceOver
      targetAudience
      tone
      unionRules
      updatedAt
      usageRightsDuration
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListBriefsQueryVariables,
  APITypes.ListBriefsQuery
>;
export const listBudgetLineItems = /* GraphQL */ `query ListBudgetLineItems(
  $filter: ModelBudgetLineItemFilterInput
  $limit: Int
  $nextToken: String
) {
  listBudgetLineItems(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      actualAmount
      actualUnits
      approvedAt
      approvedBy
      category
      createdAt
      createdBy
      createdByEmail
      description
      endDate
      estimatedAmount
      estimatedUnits
      id
      notes
      organizationId
      phase
      projectId
      purchaseOrderNumber
      startDate
      status
      subcategory
      unitRate
      unitType
      updatedAt
      variance
      vendorContact
      vendorName
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListBudgetLineItemsQueryVariables,
  APITypes.ListBudgetLineItemsQuery
>;
export const listCallSheetCasts = /* GraphQL */ `query ListCallSheetCasts(
  $filter: ModelCallSheetCastFilterInput
  $limit: Int
  $nextToken: String
) {
  listCallSheetCasts(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      actorName
      callSheetId
      callToSet
      characterName
      createdAt
      email
      id
      makeupCall
      notes
      phone
      pickupLocation
      pickupTime
      sortOrder
      updatedAt
      wardrobeCall
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCallSheetCastsQueryVariables,
  APITypes.ListCallSheetCastsQuery
>;
export const listCallSheetCrews = /* GraphQL */ `query ListCallSheetCrews(
  $filter: ModelCallSheetCrewFilterInput
  $limit: Int
  $nextToken: String
) {
  listCallSheetCrews(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      callSheetId
      callTime
      createdAt
      department
      email
      id
      name
      notes
      phone
      role
      sortOrder
      updatedAt
      walkieChannel
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCallSheetCrewsQueryVariables,
  APITypes.ListCallSheetCrewsQuery
>;
export const listCallSheetScenes = /* GraphQL */ `query ListCallSheetScenes(
  $filter: ModelCallSheetSceneFilterInput
  $limit: Int
  $nextToken: String
) {
  listCallSheetScenes(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      callSheetId
      createdAt
      description
      estimatedDuration
      id
      location
      notes
      pageCount
      sceneHeading
      sceneNumber
      scheduledTime
      sortOrder
      status
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCallSheetScenesQueryVariables,
  APITypes.ListCallSheetScenesQuery
>;
export const listCallSheets = /* GraphQL */ `query ListCallSheets(
  $filter: ModelCallSheetFilterInput
  $limit: Int
  $nextToken: String
) {
  listCallSheets(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      cateringLocation
      createdAt
      directorName
      directorPhone
      episodeNumber
      estimatedWrap
      firstADName
      firstADPhone
      generalCrewCall
      hospitalAddress
      id
      lastUpdatedBy
      mealTimes
      nearestHospital
      nextDaySchedule
      organizationId
      parkingInstructions
      primaryLocation
      primaryLocationAddress
      producerName
      producerPhone
      productionCompany
      productionManagerName
      productionManagerPhone
      productionOfficePhone
      productionTitle
      projectId
      publishedAt
      safetyNotes
      shootDate
      shootDayNumber
      specialInstructions
      status
      sunset
      temperature
      timezone
      totalShootDays
      transportationNotes
      updatedAt
      version
      weatherForecast
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCallSheetsQueryVariables,
  APITypes.ListCallSheetsQuery
>;
export const listCollectionAssets = /* GraphQL */ `query ListCollectionAssets(
  $filter: ModelCollectionAssetFilterInput
  $limit: Int
  $nextToken: String
) {
  listCollectionAssets(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      addedAt
      addedBy
      addedByEmail
      assetId
      collectionId
      createdAt
      id
      notes
      organizationId
      selectedClipIn
      selectedClipOut
      selectedFrameTimecode
      sortOrder
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCollectionAssetsQueryVariables,
  APITypes.ListCollectionAssetsQuery
>;
export const listCollections = /* GraphQL */ `query ListCollections(
  $filter: ModelCollectionFilterInput
  $limit: Int
  $nextToken: String
) {
  listCollections(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      allowComments
      allowDownloads
      assetCount
      collectionType
      color
      coverImageKey
      createdAt
      createdBy
      createdByEmail
      description
      icon
      id
      isSmartCollection
      lastModifiedAt
      lastModifiedBy
      name
      organizationId
      projectId
      shareLink
      shareLinkExpiry
      shareLinkPassword
      sharedWith
      smartLastUpdated
      smartRules
      sortBy
      sortOrder
      tags
      totalSizeBytes
      updatedAt
      viewMode
      visibility
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCollectionsQueryVariables,
  APITypes.ListCollectionsQuery
>;
export const listColorSessions = /* GraphQL */ `query ListColorSessions(
  $filter: ModelColorSessionFilterInput
  $limit: Int
  $nextToken: String
) {
  listColorSessions(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      cdlOffset
      cdlPower
      cdlSaturation
      cdlSlope
      colorSpace
      coloristEmail
      coloristName
      cost
      createdAt
      createdBy
      durationHours
      facility
      hdrFormat
      id
      lookApproved
      lookApprovedAt
      lookApprovedBy
      lutFileName
      lutKey
      name
      notes
      organizationId
      peakNits
      projectId
      sessionDate
      stage
      status
      suite
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListColorSessionsQueryVariables,
  APITypes.ListColorSessionsQuery
>;
export const listCrewCosts = /* GraphQL */ `query ListCrewCosts(
  $filter: ModelCrewCostFilterInput
  $limit: Int
  $nextToken: String
) {
  listCrewCosts(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      baseCost
      baseRate
      callSheetId
      callTime
      createdAt
      createdBy
      crewMemberEmail
      crewMemberName
      deductions
      department
      doubleTimeCost
      doubleTimeHours
      id
      kitFee
      kitFeeCost
      mealPenaltyCost
      mealPenaltyHours
      mileageCost
      mileageRate
      netPay
      notes
      organizationId
      overtimeCost
      overtimeHours
      overtimeRate
      paymentDate
      paymentReference
      paymentStatus
      perDiem
      perDiemCost
      projectId
      rateType
      regularHours
      role
      shootDay
      taxWithheld
      timesheetApproved
      timesheetApprovedAt
      timesheetApprovedBy
      timesheetKey
      totalCost
      travelHours
      updatedAt
      workDate
      wrapTime
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCrewCostsQueryVariables,
  APITypes.ListCrewCostsQuery
>;
export const listCustomMetadataSchemas = /* GraphQL */ `query ListCustomMetadataSchemas(
  $filter: ModelCustomMetadataSchemaFilterInput
  $limit: Int
  $nextToken: String
) {
  listCustomMetadataSchemas(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      appliesTo
      assetTypes
      canEditRoles
      canViewRoles
      collapsedByDefault
      createdAt
      createdBy
      description
      displayOrder
      fields
      id
      isActive
      lastModifiedAt
      lastModifiedBy
      name
      organizationId
      showInDetail
      showInList
      slug
      updatedAt
      version
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCustomMetadataSchemasQueryVariables,
  APITypes.ListCustomMetadataSchemasQuery
>;
export const listCustomMetadataValues = /* GraphQL */ `query ListCustomMetadataValues(
  $filter: ModelCustomMetadataValueFilterInput
  $limit: Int
  $nextToken: String
) {
  listCustomMetadataValues(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      changeHistory
      createdAt
      createdBy
      id
      lastModifiedAt
      lastModifiedBy
      organizationId
      schemaId
      targetId
      targetType
      updatedAt
      values
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCustomMetadataValuesQueryVariables,
  APITypes.ListCustomMetadataValuesQuery
>;
export const listDailyCostSummaries = /* GraphQL */ `query ListDailyCostSummaries(
  $filter: ModelDailyCostSummaryFilterInput
  $limit: Int
  $nextToken: String
) {
  listDailyCostSummaries(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      callSheetId
      cateringCost
      createdAt
      createdBy
      crewBaseCost
      crewCount
      crewKitFees
      crewOvertimeCost
      crewOvertimeHours
      crewPerDiem
      crewTotalCost
      crewTotalHours
      date
      equipmentOwnedCost
      equipmentRentalCost
      equipmentTotalCost
      finalizedAt
      finalizedBy
      id
      isFinalized
      issues
      locationFees
      locationTotalCost
      miscCost
      notes
      organizationId
      otherTotalCost
      parkingCost
      permitFees
      projectId
      shootDay
      talentFees
      talentPerDiem
      talentTotalCost
      totalActualCost
      totalPlannedCost
      transportCost
      updatedAt
      variance
      variancePercentage
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListDailyCostSummariesQueryVariables,
  APITypes.ListDailyCostSummariesQuery
>;
export const listDailyProductionReports = /* GraphQL */ `query ListDailyProductionReports(
  $filter: ModelDailyProductionReportFilterInput
  $limit: Int
  $nextToken: String
) {
  listDailyProductionReports(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      approvedAt
      approvedBy
      cameraWrap
      cardsUsed
      completedScenes
      createdAt
      createdBy
      createdByEmail
      crewCall
      crewWrap
      date
      director
      firstAD
      firstShot
      goodTakes
      id
      incidents
      lastShot
      lunchEnd
      lunchStart
      mealPenalties
      organizationId
      overtimeCrew
      partialScenes
      producer
      productionNotes
      projectId
      rejectionReason
      runningTotal
      scheduledScenes
      shootDay
      status
      storageUsedGB
      submittedAt
      submittedBy
      temperature
      tomorrowPrep
      totalCrewMembers
      totalMinutesShot
      totalSetups
      totalTakes
      unit
      updatedAt
      upm
      weatherConditions
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListDailyProductionReportsQueryVariables,
  APITypes.ListDailyProductionReportsQuery
>;
export const listDistributionLinks = /* GraphQL */ `query ListDistributionLinks(
  $filter: ModelDistributionLinkFilterInput
  $limit: Int
  $nextToken: String
) {
  listDistributionLinks(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      accessCode
      accessToken
      allowDownload
      allowShare
      allowedCountries
      assetId
      assetVersionId
      averageViewDuration
      blockedCountries
      completionRate
      createdAt
      createdBy
      createdByEmail
      currentViews
      description
      downloadResolution
      expiresAt
      geoRestriction
      id
      isExpired
      isPasswordProtected
      isWatermarked
      lastAccessedAt
      lastAccessedBy
      lastAccessedFrom
      linkType
      maxViews
      name
      notifyOnDownload
      notifyOnView
      organizationId
      playlistAssetIds
      projectId
      recipientCompany
      recipientEmail
      recipientName
      recipientRole
      revokedAt
      revokedBy
      revokedReason
      status
      streamQuality
      totalViewDuration
      updatedAt
      watermarkOpacity
      watermarkPosition
      watermarkText
      watermarkType
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListDistributionLinksQueryVariables,
  APITypes.ListDistributionLinksQuery
>;
export const listDistributionViewLogs = /* GraphQL */ `query ListDistributionViewLogs(
  $filter: ModelDistributionViewLogFilterInput
  $limit: Int
  $nextToken: String
) {
  listDistributionViewLogs(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      averageBitrate
      bufferingDuration
      bufferingEvents
      createdAt
      distributionLinkId
      downloadAttempted
      duration
      endTime
      geoBlockReason
      geoBlocked
      id
      pauseEvents
      percentageWatched
      playbackSpeed
      qualityChanges
      screenshotAttempted
      seekEvents
      sessionId
      startTime
      updatedAt
      viewerBrowser
      viewerCity
      viewerCountry
      viewerDevice
      viewerEmail
      viewerIP
      viewerName
      viewerOS
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListDistributionViewLogsQueryVariables,
  APITypes.ListDistributionViewLogsQuery
>;
export const listDownloadRequests = /* GraphQL */ `query ListDownloadRequests(
  $filter: ModelDownloadRequestFilterInput
  $limit: Int
  $nextToken: String
) {
  listDownloadRequests(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      applyWatermark
      assetIds
      burnInSubtitles
      burnInTimecode
      collectionId
      completedAt
      createdAt
      downloadCount
      downloadKey
      downloadUrl
      downloadedBy
      errorMessage
      expiresAt
      fileCount
      folderStructure
      id
      includeMetadata
      includeSidecar
      includeTranscript
      lastDownloadedAt
      organizationId
      outputCodec
      outputFormat
      outputFrameRate
      outputResolution
      packageFormat
      progress
      requestType
      requestedAt
      requestedBy
      requestedByEmail
      startedAt
      status
      totalSizeBytes
      updatedAt
      watermarkOpacity
      watermarkPosition
      watermarkText
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListDownloadRequestsQueryVariables,
  APITypes.ListDownloadRequestsQuery
>;
export const listEditSessions = /* GraphQL */ `query ListEditSessions(
  $filter: ModelEditSessionFilterInput
  $limit: Int
  $nextToken: String
) {
  listEditSessions(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      addressedNotes
      approvedAt
      approvedBy
      completedAt
      createdAt
      createdBy
      duration
      editorEmail
      editorName
      exportKey
      frameRate
      id
      isCurrentVersion
      name
      organizationId
      projectId
      resolution
      stage
      startedAt
      status
      timelineKey
      totalNotes
      updatedAt
      versionNumber
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListEditSessionsQueryVariables,
  APITypes.ListEditSessionsQuery
>;
export const listEquipment = /* GraphQL */ `query ListEquipment(
  $filter: ModelEquipmentFilterInput
  $limit: Int
  $nextToken: String
) {
  listEquipment(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      assetTag
      barcode
      calibrationDate
      category
      condition
      createdAt
      description
      homeBase
      id
      imageKey
      insurancePolicyNumber
      insuranceValue
      lastMaintenanceDate
      maintenanceNotes
      manufacturer
      model
      name
      nextMaintenanceDate
      organizationId
      ownershipType
      purchaseDate
      purchasePrice
      rentalRate
      replacementValue
      serialNumber
      specifications
      status
      storageLocation
      subcategory
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListEquipmentQueryVariables,
  APITypes.ListEquipmentQuery
>;
export const listEquipmentCheckouts = /* GraphQL */ `query ListEquipmentCheckouts(
  $filter: ModelEquipmentCheckoutFilterInput
  $limit: Int
  $nextToken: String
) {
  listEquipmentCheckouts(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      actualReturnDate
      approvedBy
      checkedOutBy
      checkedOutByName
      checkoutDate
      checkoutSignature
      conditionAtCheckout
      conditionAtReturn
      conditionNotes
      createdAt
      damageDescription
      damageReported
      equipmentId
      expectedReturnDate
      id
      organizationId
      projectId
      purpose
      returnSignature
      returnedBy
      shootLocation
      status
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListEquipmentCheckoutsQueryVariables,
  APITypes.ListEquipmentCheckoutsQuery
>;
export const listEquipmentKitItems = /* GraphQL */ `query ListEquipmentKitItems(
  $filter: ModelEquipmentKitItemFilterInput
  $limit: Int
  $nextToken: String
) {
  listEquipmentKitItems(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      createdAt
      equipmentId
      id
      isRequired
      kitId
      notes
      quantity
      sortOrder
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListEquipmentKitItemsQueryVariables,
  APITypes.ListEquipmentKitItemsQuery
>;
export const listEquipmentKits = /* GraphQL */ `query ListEquipmentKits(
  $filter: ModelEquipmentKitFilterInput
  $limit: Int
  $nextToken: String
) {
  listEquipmentKits(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      category
      createdAt
      description
      id
      isActive
      isTemplate
      itemCount
      name
      organizationId
      totalValue
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListEquipmentKitsQueryVariables,
  APITypes.ListEquipmentKitsQuery
>;
export const listEquipmentRentals = /* GraphQL */ `query ListEquipmentRentals(
  $filter: ModelEquipmentRentalFilterInput
  $limit: Int
  $nextToken: String
) {
  listEquipmentRentals(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      contractKey
      createdAt
      createdBy
      createdByEmail
      dailyRate
      damageCost
      damageNotes
      deliveryFee
      depositAmount
      depositPaid
      depositPaidDate
      description
      discountAmount
      equipmentCategory
      equipmentId
      equipmentName
      id
      insuranceCost
      insuranceRate
      invoiceKey
      invoiceNumber
      lateFee
      monthlyRate
      notes
      organizationId
      paymentDate
      paymentMethod
      paymentReference
      paymentStatus
      pickupDate
      pickupFee
      projectId
      purchaseOrderNumber
      quantity
      quoteNumber
      rentalDays
      rentalEndDate
      rentalStartDate
      returnCondition
      returnDate
      serialNumber
      status
      subtotal
      taxAmount
      totalCost
      updatedAt
      usageByDay
      vendorAddress
      vendorContact
      vendorEmail
      vendorName
      vendorPhone
      weeklyRate
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListEquipmentRentalsQueryVariables,
  APITypes.ListEquipmentRentalsQuery
>;
export const listExpenses = /* GraphQL */ `query ListExpenses(
  $filter: ModelExpenseFilterInput
  $limit: Int
  $nextToken: String
) {
  listExpenses(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      amount
      approvedAt
      approvedBy
      budgetLineItemId
      category
      createdAt
      createdBy
      createdByEmail
      currency
      description
      exchangeRate
      expenseDate
      hasReceipt
      id
      invoiceDate
      invoiceNumber
      isReimbursement
      notes
      organizationId
      paymentDate
      paymentMethod
      paymentReference
      paymentStatus
      phase
      projectId
      receiptFileName
      receiptKey
      reimburseTo
      reimburseToName
      reimbursementStatus
      rejectionReason
      shootDay
      status
      subcategory
      submittedAt
      submittedBy
      updatedAt
      vendorId
      vendorName
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListExpensesQueryVariables,
  APITypes.ListExpensesQuery
>;
export const listInvoices = /* GraphQL */ `query ListInvoices(
  $filter: ModelInvoiceFilterInput
  $limit: Int
  $nextToken: String
) {
  listInvoices(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      billingPeriod
      createdAt
      currency
      discount
      dueDate
      hostedInvoiceUrl
      id
      invoiceNumber
      invoicePdfUrl
      lineItems
      notes
      organizationId
      paidAt
      paymentMethod
      periodEnd
      periodStart
      status
      stripeInvoiceId
      subtotal
      tax
      total
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListInvoicesQueryVariables,
  APITypes.ListInvoicesQuery
>;
export const listLocationCosts = /* GraphQL */ `query ListLocationCosts(
  $filter: ModelLocationCostFilterInput
  $limit: Int
  $nextToken: String
) {
  listLocationCosts(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      callSheetId
      cancellationFee
      cateringFee
      cleaningFee
      contactEmail
      contactName
      contactPhone
      contractKey
      contractSigned
      contractSignedDate
      costByDay
      createdAt
      createdBy
      createdByEmail
      dailyRate
      damageDeposit
      depositPaid
      depositPaidDate
      feeType
      halfDayRate
      holdingFee
      hourlyRate
      id
      insuranceCertKey
      insuranceFee
      invoiceKey
      locationAddress
      locationFee
      locationName
      locationType
      notes
      organizationId
      otherFees
      otherFeesDescription
      overtimeRate
      ownerName
      parkingFee
      paymentDate
      paymentMethod
      paymentReference
      paymentStatus
      permitFee
      permitKey
      powerFee
      projectId
      restrictions
      securityFee
      shootDays
      specialRequirements
      status
      subtotal
      taxAmount
      totalCost
      updatedAt
      useDays
      useEndDate
      useStartDate
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListLocationCostsQueryVariables,
  APITypes.ListLocationCostsQuery
>;
export const listMessages = /* GraphQL */ `query ListMessages(
  $filter: ModelMessageFilterInput
  $limit: Int
  $nextToken: String
) {
  listMessages(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      assetId
      attachmentKeys
      attachmentNames
      convertedToTask
      createdAt
      deletedAt
      editedAt
      id
      isDeleted
      isEdited
      mentionedUsers
      messageText
      messageType
      organizationId
      owner
      parentMessageId
      priority
      projectId
      readBy
      senderEmail
      senderId
      senderName
      senderRole
      taskAssignedTo
      taskDeadline
      taskId
      threadDepth
      timecode
      timecodeFormatted
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListMessagesQueryVariables,
  APITypes.ListMessagesQuery
>;
export const listNotifications = /* GraphQL */ `query ListNotifications(
  $filter: ModelNotificationFilterInput
  $limit: Int
  $nextToken: String
) {
  listNotifications(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      actionLabel
      actionUrl
      assetId
      assetName
      createdAt
      deliveryChannels
      emailSent
      emailSentAt
      expiresAt
      id
      isRead
      message
      messageId
      organizationId
      owner
      priority
      projectId
      projectName
      readAt
      reviewId
      senderEmail
      senderId
      senderName
      slackSent
      slackSentAt
      smsSent
      smsSentAt
      title
      type
      updatedAt
      userId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListNotificationsQueryVariables,
  APITypes.ListNotificationsQuery
>;
export const listOrganizationInvitations = /* GraphQL */ `query ListOrganizationInvitations(
  $filter: ModelOrganizationInvitationFilterInput
  $limit: Int
  $nextToken: String
) {
  listOrganizationInvitations(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      acceptedAt
      createdAt
      declinedAt
      email
      expiresAt
      id
      inviteToken
      invitedBy
      invitedByEmail
      lastReminderAt
      message
      organizationId
      remindersSent
      role
      status
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListOrganizationInvitationsQueryVariables,
  APITypes.ListOrganizationInvitationsQuery
>;
export const listOrganizationMembers = /* GraphQL */ `query ListOrganizationMembers(
  $filter: ModelOrganizationMemberFilterInput
  $limit: Int
  $nextToken: String
) {
  listOrganizationMembers(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      apiKeyId
      apiKeyLastUsed
      avatar
      createdAt
      customPermissions
      department
      email
      emailNotifications
      id
      invitedAt
      invitedBy
      joinedAt
      lastActiveAt
      name
      organizationId
      owner
      phone
      role
      slackNotifications
      slackUserId
      status
      suspendedAt
      suspendedBy
      suspendedReason
      title
      updatedAt
      userId
      weeklyDigest
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListOrganizationMembersQueryVariables,
  APITypes.ListOrganizationMembersQuery
>;
export const listOrganizations = /* GraphQL */ `query ListOrganizations(
  $filter: ModelOrganizationFilterInput
  $limit: Int
  $nextToken: String
) {
  listOrganizations(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      address
      autoArchiveDays
      billingCycleDay
      brandAccentColor
      brandPrimaryColor
      brandSecondaryColor
      city
      country
      createdAt
      createdBy
      currency
      currentAICreditsUsed
      currentProjectCount
      currentStorageUsedGB
      currentUserCount
      customDomain
      customFeatures
      dataProcessingAgreementSigned
      dataRetentionDays
      deletedAt
      description
      dpaSignedAt
      email
      emailFromAddress
      emailFromName
      featuresEnabled
      id
      industry
      ipWhitelist
      isGDPRCompliant
      isHIPAACompliant
      isSOC2Compliant
      locale
      logo
      maxAICredits
      maxProjects
      maxStorageGB
      maxUsers
      mfaRequired
      name
      onboardingCompleted
      onboardingCompletedAt
      onboardingStep
      owner
      phone
      postalCode
      sessionTimeoutMinutes
      slug
      ssoConfig
      ssoEnabled
      ssoProvider
      state
      status
      stripeCustomerId
      stripePaymentMethodId
      stripePriceId
      stripeSubscriptionId
      subscriptionEndsAt
      subscriptionStartedAt
      subscriptionStatus
      subscriptionTier
      suspendedAt
      suspendedReason
      timezone
      trialEndsAt
      updatedAt
      usageResetDate
      website
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListOrganizationsQueryVariables,
  APITypes.ListOrganizationsQuery
>;
export const listProjectArchives = /* GraphQL */ `query ListProjectArchives(
  $filter: ModelProjectArchiveFilterInput
  $limit: Int
  $nextToken: String
) {
  listProjectArchives(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      accessCount
      aiKeyMoments
      aiLessonsLearned
      aiSummary
      approvals
      archiveReason
      archiveStatus
      archivedAt
      archivedBy
      assetGraph
      budgetSummary
      costPerDeliverable
      createdAt
      deliverables
      greenlightHistory
      id
      keyAssets
      keyAssetsMetadata
      keywords
      lastAccessedAt
      legalDetails
      legalStatus
      masterDeliverableIds
      metadataSummary
      organizationId
      productionStats
      projectId
      reconstructionManifest
      regionRestrictions
      rightsExpirations
      roiCalculated
      searchEmbedding
      themes
      timelinePhases
      topics
      totalCost
      updatedAt
      versionTree
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListProjectArchivesQueryVariables,
  APITypes.ListProjectArchivesQuery
>;
export const listProjectMembers = /* GraphQL */ `query ListProjectMembers(
  $filter: ModelProjectMemberFilterInput
  $limit: Int
  $nextToken: String
) {
  listProjectMembers(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      accessExpiresAt
      accessStartsAt
      assignedAssetIds
      assignedPhases
      assignedTaskIds
      avatar
      createdAt
      customPermissions
      email
      emailNotifications
      externalRole
      id
      invitedAt
      invitedBy
      isExternal
      joinedAt
      lastActiveAt
      name
      organizationId
      owner
      projectId
      projectRole
      revokedAt
      revokedBy
      revokedReason
      slackUserId
      status
      suspendedAt
      suspendedBy
      suspendedReason
      title
      updatedAt
      userId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListProjectMembersQueryVariables,
  APITypes.ListProjectMembersQuery
>;
export const listProjects = /* GraphQL */ `query ListProjects(
  $filter: ModelProjectFilterInput
  $limit: Int
  $nextToken: String
) {
  listProjects(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      archiveComplete
      archiveCompletedAt
      archiveLocation
      assetsDelivered
      assetsDeliveredAt
      briefComplete
      briefCompletedAt
      budgetApproved
      budgetApprovedAt
      budgetCap
      budgetContingency
      budgetDistribution
      budgetPostProduction
      budgetPreProduction
      budgetProduction
      callSheetsReady
      callSheetsReadyAt
      clientContactEmail
      confidentiality
      contractsSigned
      contractsSignedAt
      createdAt
      creativeDirectorEmail
      deadline
      deliverablesReady
      deliverablesReadyAt
      deliveryConfirmedBy
      department
      description
      distributionDate
      executiveSponsorEmail
      fieldIntelligenceFeasibilityScore
      fieldIntelligenceHealthAlerts
      fieldIntelligenceLastUpdated
      fieldIntelligenceRiskAlerts
      fieldIntelligenceWeatherData
      finalApproved
      finalApprovedAt
      finalApprovedBy
      finalAssetId
      financeContactEmail
      fundingSource
      greenlightBlockers
      greenlightClientApproved
      greenlightClientApprovedAt
      greenlightClientApprovedBy
      greenlightClientComment
      greenlightCompletedAt
      greenlightExecutiveApproved
      greenlightExecutiveApprovedAt
      greenlightExecutiveApprovedBy
      greenlightExecutiveComment
      greenlightFinanceApproved
      greenlightFinanceApprovedAt
      greenlightFinanceApprovedBy
      greenlightFinanceComment
      greenlightLegalApproved
      greenlightLegalApprovedAt
      greenlightLegalApprovedBy
      greenlightLegalComment
      greenlightProducerApproved
      greenlightProducerApprovedAt
      greenlightProducerApprovedBy
      greenlightProducerComment
      greenlightRequirements
      id
      kickoffDate
      legalApproved
      legalApprovedAt
      legalContactEmail
      legalLockDeadline
      lifecycleState
      locationsConfirmed
      locationsConfirmedAt
      mediaIngested
      name
      organizationId
      owner
      permitsObtained
      permitsObtainedAt
      postProductionEndDate
      postProductionStartDate
      preProductionEndDate
      preProductionStartDate
      primaryKPI
      principalPhotographyComplete
      principalPhotographyCompleteAt
      priority
      producerEmail
      productionEndDate
      productionStartDate
      projectOwnerEmail
      projectType
      purchaseOrderNumber
      reviewDeadline
      roughCutAssetId
      roughCutComplete
      roughCutCompleteAt
      shootLocationCity
      shootLocationCoordinates
      shootLocationCountry
      stakeholderSignoff
      stakeholderSignoffAt
      status
      targetMetric
      teamAssigned
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListProjectsQueryVariables,
  APITypes.ListProjectsQuery
>;
export const listProxyFiles = /* GraphQL */ `query ListProxyFiles(
  $filter: ModelProxyFileFilterInput
  $limit: Int
  $nextToken: String
) {
  listProxyFiles(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      assetId
      assetVersionId
      audioBitrate
      audioCodec
      bitrate
      cdnUrl
      codec
      createdAt
      createdBy
      duration
      errorMessage
      fileSizeBytes
      frameRate
      id
      jobId
      lastViewedAt
      organizationId
      processingCompleted
      processingDuration
      processingStarted
      processor
      progress
      proxyType
      resolution
      s3Bucket
      s3Key
      status
      updatedAt
      viewCount
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListProxyFilesQueryVariables,
  APITypes.ListProxyFilesQuery
>;
export const listQCReports = /* GraphQL */ `query ListQCReports(
  $filter: ModelQCReportFilterInput
  $limit: Int
  $nextToken: String
) {
  listQCReports(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      assetId
      audioQuality
      audioTechnical
      checkResults
      compliance
      createdAt
      createdBy
      criticalIssues
      deliverableId
      editorial
      failedChecks
      graphicsText
      id
      majorIssues
      minorIssues
      name
      organizationId
      overallStatus
      passedChecks
      projectId
      qcDate
      qcDuration
      qcOperator
      qcOperatorEmail
      reportKey
      reportType
      signOffNotes
      signedOffAt
      signedOffBy
      totalChecks
      updatedAt
      videoQuality
      videoTechnical
      warningChecks
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListQCReportsQueryVariables,
  APITypes.ListQCReportsQuery
>;
export const listQualityScores = /* GraphQL */ `query ListQualityScores(
  $filter: ModelQualityScoreFilterInput
  $limit: Int
  $nextToken: String
) {
  listQualityScores(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      analysisDuration
      analysisVersion
      analyzedAt
      analyzedBy
      assetId
      assetVersionId
      audioBitrate
      audioChannels
      audioClippingDetected
      audioCodec
      audioLoudnessLUFS
      audioNoiseFloor
      audioPeakdB
      audioQualityScore
      audioSampleRate
      audioSilencePercentage
      checksumMD5
      checksumSHA256
      colorGradeConsistency
      complianceIssues
      compositionScore
      contentClarity
      corruptionDetails
      createdAt
      fileIntegrity
      formatCompliance
      grade
      id
      motionSmoothnessScore
      organizationId
      overallScore
      projectId
      recommendedFixes
      updatedAt
      videoBitDepth
      videoBitrate
      videoBitrateScore
      videoCodec
      videoColorSpace
      videoExposureScore
      videoFrameRate
      videoHDR
      videoResolution
      videoResolutionScore
      videoStabilityScore
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListQualityScoresQueryVariables,
  APITypes.ListQualityScoresQuery
>;
export const listRestoreRequests = /* GraphQL */ `query ListRestoreRequests(
  $filter: ModelRestoreRequestFilterInput
  $limit: Int
  $nextToken: String
) {
  listRestoreRequests(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      actualCost
      assetId
      completedAt
      createdAt
      errorMessage
      estimatedCompletion
      estimatedCost
      expiresAt
      id
      notificationSent
      notifyOnComplete
      organizationId
      partialEndSeconds
      partialReason
      partialStartSeconds
      projectId
      requestType
      requestedAt
      requestedBy
      requestedByEmail
      restoreDurationDays
      restoreTier
      restoredKey
      restoredSize
      status
      storageTierId
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListRestoreRequestsQueryVariables,
  APITypes.ListRestoreRequestsQuery
>;
export const listReviewCommentReplies = /* GraphQL */ `query ListReviewCommentReplies(
  $filter: ModelReviewCommentReplyFilterInput
  $limit: Int
  $nextToken: String
) {
  listReviewCommentReplies(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      createdAt
      id
      owner
      parentCommentId
      replierEmail
      replierId
      replierRole
      replyText
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListReviewCommentRepliesQueryVariables,
  APITypes.ListReviewCommentRepliesQuery
>;
export const listReviewComments = /* GraphQL */ `query ListReviewComments(
  $filter: ModelReviewCommentFilterInput
  $limit: Int
  $nextToken: String
) {
  listReviewComments(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      assetId
      attachmentKeys
      commentText
      commentType
      commenterEmail
      commenterId
      commenterRole
      createdAt
      id
      isResolved
      linkedAssetVersionId
      linkedTaskId
      linkedTaskStatus
      organizationId
      owner
      priority
      projectId
      resolvedAt
      resolvedBy
      resolvedByEmail
      resolvedInAssetVersionId
      reviewId
      timecode
      timecodeFormatted
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListReviewCommentsQueryVariables,
  APITypes.ListReviewCommentsQuery
>;
export const listReviews = /* GraphQL */ `query ListReviews(
  $filter: ModelReviewFilterInput
  $limit: Int
  $nextToken: String
) {
  listReviews(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      assetId
      createdAt
      id
      isLegalApproved
      legalApprovedAt
      legalApprovedBy
      organizationId
      owner
      projectId
      reviewerEmail
      reviewerId
      reviewerRole
      status
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListReviewsQueryVariables,
  APITypes.ListReviewsQuery
>;
export const listRightsDocuments = /* GraphQL */ `query ListRightsDocuments(
  $filter: ModelRightsDocumentFilterInput
  $limit: Int
  $nextToken: String
) {
  listRightsDocuments(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      approvalDate
      approvedBy
      approvedByName
      coverageAmount
      coverageType
      createdAt
      description
      documentNumber
      documentType
      effectiveDate
      expirationDate
      fileKey
      fileName
      fileSize
      id
      isCritical
      isLatestVersion
      isRequired
      issueDate
      issuingAuthority
      jurisdiction
      lastReminderSent
      locationAddress
      locationName
      mimeType
      name
      notes
      organizationId
      personEmail
      personName
      personRole
      previousVersionId
      projectId
      rejectionReason
      reminderDays
      renewalDate
      restrictions
      reviewDate
      reviewedBy
      reviewedByName
      shootDay
      status
      tags
      thumbnailKey
      updatedAt
      uploadedBy
      uploadedByName
      version
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListRightsDocumentsQueryVariables,
  APITypes.ListRightsDocumentsQuery
>;
export const listSavedSearches = /* GraphQL */ `query ListSavedSearches(
  $filter: ModelSavedSearchFilterInput
  $limit: Int
  $nextToken: String
) {
  listSavedSearches(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      color
      createdAt
      createdBy
      createdByEmail
      description
      displayOrder
      filters
      icon
      id
      isPinned
      lastModifiedAt
      lastModifiedBy
      lastNotifiedAt
      lastUsedAt
      name
      notifyEmail
      notifyOnNewMatches
      organizationId
      projectId
      scope
      searchQuery
      sharedWith
      sortBy
      sortOrder
      updatedAt
      usageCount
      visibility
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListSavedSearchesQueryVariables,
  APITypes.ListSavedSearchesQuery
>;
export const listShareLinks = /* GraphQL */ `query ListShareLinks(
  $filter: ModelShareLinkFilterInput
  $limit: Int
  $nextToken: String
) {
  listShareLinks(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      accessLog
      allowComment
      allowDownload
      allowPreview
      allowedDomains
      allowedEmails
      createdAt
      createdBy
      createdByEmail
      deactivatedAt
      deactivatedBy
      deactivationReason
      downloadCount
      downloadQuality
      expiresAt
      id
      isActive
      lastAccessedAt
      lastAccessedBy
      maxDownloads
      maxViews
      name
      notifyEmail
      notifyOnAccess
      organizationId
      password
      requiresPassword
      shareType
      targetIds
      token
      updatedAt
      viewCount
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListShareLinksQueryVariables,
  APITypes.ListShareLinksQuery
>;
export const listShotListTrackers = /* GraphQL */ `query ListShotListTrackers(
  $filter: ModelShotListTrackerFilterInput
  $limit: Int
  $nextToken: String
) {
  listShotListTrackers(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      briefId
      callSheetId
      captureStatus
      capturedAssetIds
      capturedAt
      capturedBy
      continuityNotes
      createdAt
      directorApproved
      directorApprovedAt
      dpApproved
      dpApprovedAt
      framing
      id
      movement
      notes
      organizationId
      plannedDuration
      projectId
      propNotes
      proposalId
      qualityNotes
      qualityRating
      selectedAssetId
      shootDay
      shotDescription
      shotNumber
      shotType
      takeCount
      updatedAt
      wardrobeNotes
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListShotListTrackersQueryVariables,
  APITypes.ListShotListTrackersQuery
>;
export const listShotLogs = /* GraphQL */ `query ListShotLogs(
  $filter: ModelShotLogFilterInput
  $limit: Int
  $nextToken: String
) {
  listShotLogs(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      camera
      cardId
      circled
      continuityNotes
      createdAt
      dprId
      duration
      fStop
      fps
      id
      iso
      lens
      loggedBy
      loggedByEmail
      notes
      organizationId
      performanceNotes
      projectId
      scene
      shot
      status
      take
      technicalNotes
      timecodeIn
      timecodeOut
      timestamp
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListShotLogsQueryVariables,
  APITypes.ListShotLogsQuery
>;
export const listSocialOutputs = /* GraphQL */ `query ListSocialOutputs(
  $filter: ModelSocialOutputFilterInput
  $limit: Int
  $nextToken: String
) {
  listSocialOutputs(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      addEndCard
      addWatermark
      aspectRatio
      audioTrack
      captionFileKey
      captionLanguage
      captionStyle
      cmsEndpoint
      cmsIntegration
      cmsPublishStatus
      cmsPublishedAt
      cmsPublishedUrl
      createdAt
      createdBy
      createdByEmail
      cropPosition
      cropX
      cropY
      customHeight
      customWidth
      description
      endCardDuration
      endCardKey
      id
      includeCaptions
      includeSubtitles
      isScheduled
      maxDuration
      name
      normalizeAudio
      organizationId
      outputBitrate
      outputCodec
      outputDuration
      outputFileKey
      outputFileSize
      outputFormat
      outputResolution
      platform
      postCallToAction
      postCallToActionUrl
      postCaption
      postCategory
      postDescription
      postHashtags
      postLocation
      postMentions
      postPrivacy
      postTags
      postThumbnailKey
      postTitle
      processingCompletedAt
      processingError
      processingProgress
      processingStartedAt
      projectId
      scheduledPublishAt
      socialPostId
      socialPublishError
      socialPublishStatus
      socialPublishedAt
      socialPublishedUrl
      sourceAssetId
      sourceVersionId
      status
      subtitleLanguages
      targetLoudness
      trimEnd
      trimStart
      updatedAt
      watermarkKey
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListSocialOutputsQueryVariables,
  APITypes.ListSocialOutputsQuery
>;
export const listStorageTiers = /* GraphQL */ `query ListStorageTiers(
  $filter: ModelStorageTierFilterInput
  $limit: Int
  $nextToken: String
) {
  listStorageTiers(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      archiveReason
      archivedAt
      archivedBy
      assetId
      createdAt
      currentStorageClass
      fileSizeBytes
      id
      isArchived
      isRestoring
      lastChecked
      lastCostCalculation
      lastRestoredAt
      lifecyclePolicyApplied
      monthlyStorageCost
      nextTransitionClass
      nextTransitionDate
      organizationId
      originalStorageClass
      partialRestoreExpiresAt
      partialRestoreKey
      partialRestoreRanges
      projectId
      projectedAnnualCost
      restoreCount
      restoreExpiresAt
      restoreRequestedAt
      restoreRequestedBy
      restoreType
      s3Bucket
      s3Key
      totalStorageCostToDate
      transitionHistory
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListStorageTiersQueryVariables,
  APITypes.ListStorageTiersQuery
>;
export const listSubscriptionPlans = /* GraphQL */ `query ListSubscriptionPlans(
  $filter: ModelSubscriptionPlanFilterInput
  $limit: Int
  $nextToken: String
) {
  listSubscriptionPlans(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      annualPrice
      createdAt
      currency
      description
      features
      featuresDescription
      id
      isActive
      isPopular
      isPublic
      maxAICreditsPerMonth
      maxBandwidthGB
      maxProjects
      maxStorageGB
      maxUsers
      monthlyPrice
      name
      slug
      sortOrder
      stripePriceIdAnnual
      stripePriceIdMonthly
      tier
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListSubscriptionPlansQueryVariables,
  APITypes.ListSubscriptionPlansQuery
>;
export const listTasks = /* GraphQL */ `query ListTasks(
  $filter: ModelTaskFilterInput
  $limit: Int
  $nextToken: String
) {
  listTasks(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      actualHours
      assignedAt
      assignedBy
      assignedByEmail
      assignedToEmail
      assignedToName
      attachmentKeys
      blockedBy
      blockedReason
      completedAt
      completedBy
      completedByEmail
      createdAt
      createdBy
      createdByEmail
      dependsOn
      description
      dueDate
      estimatedHours
      id
      linkedAssetId
      linkedAssetName
      linkedTimecode
      linkedTimecodeFormatted
      organizationId
      priority
      progressPercentage
      projectId
      resolutionNote
      resolvedInAssetVersionId
      resolvedInAssetVersionNumber
      sourceAssetId
      sourceCommentId
      sourceMessageId
      startDate
      status
      tags
      taskType
      title
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListTasksQueryVariables, APITypes.ListTasksQuery>;
export const listTeamMembers = /* GraphQL */ `query ListTeamMembers(
  $filter: ModelTeamMemberFilterInput
  $limit: Int
  $nextToken: String
) {
  listTeamMembers(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      acceptedAt
      avatar
      company
      contributionCount
      createdAt
      customRoleTitle
      department
      email
      id
      invitedAt
      invitedBy
      lastActiveAt
      name
      notifyOnApprovals
      notifyOnAssets
      notifyOnMessages
      notifyOnTasks
      organizationId
      permissions
      phone
      projectId
      removalReason
      removedAt
      removedBy
      role
      status
      title
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListTeamMembersQueryVariables,
  APITypes.ListTeamMembersQuery
>;
export const listTranscriptions = /* GraphQL */ `query ListTranscriptions(
  $filter: ModelTranscriptionFilterInput
  $limit: Int
  $nextToken: String
) {
  listTranscriptions(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      assetId
      assetVersionId
      averageConfidence
      completedAt
      createdAt
      createdBy
      errorMessage
      fullText
      hasManualEdits
      id
      jobId
      keywords
      language
      languageConfidence
      lastEditedAt
      lastEditedBy
      lowConfidenceSegments
      organizationId
      progress
      provider
      segments
      speakerCount
      speakers
      srtKey
      status
      transcriptKey
      updatedAt
      vttKey
      wordCount
      words
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListTranscriptionsQueryVariables,
  APITypes.ListTranscriptionsQuery
>;
export const listUsageRecords = /* GraphQL */ `query ListUsageRecords(
  $filter: ModelUsageRecordFilterInput
  $limit: Int
  $nextToken: String
) {
  listUsageRecords(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      billingPeriod
      createdAt
      currency
      description
      id
      includedQuantity
      organizationId
      overageCost
      overageQuantity
      periodEnd
      periodStart
      projectId
      quantity
      totalCost
      unit
      unitPrice
      updatedAt
      usageType
      userId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListUsageRecordsQueryVariables,
  APITypes.ListUsageRecordsQuery
>;
export const listVFXShots = /* GraphQL */ `query ListVFXShots(
  $filter: ModelVFXShotFilterInput
  $limit: Int
  $nextToken: String
) {
  listVFXShots(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      actualAmount
      bidAmount
      briefKey
      complexity
      createdAt
      createdBy
      currentVersion
      deliveryStage
      description
      dueDate
      frameCount
      frameIn
      frameOut
      id
      latestDeliveryKey
      notes
      organizationId
      plateDelivered
      plateDeliveredAt
      plateKey
      projectId
      referenceDelivered
      referenceDeliveredAt
      sequence
      shotCode
      status
      updatedAt
      variance
      vendor
      vendorContact
      vendorEmail
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListVFXShotsQueryVariables,
  APITypes.ListVFXShotsQuery
>;
export const listWorkflowExecutionLogs = /* GraphQL */ `query ListWorkflowExecutionLogs(
  $filter: ModelWorkflowExecutionLogFilterInput
  $limit: Int
  $nextToken: String
) {
  listWorkflowExecutionLogs(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      actionResults
      assetIds
      assetsFailed
      assetsProcessed
      assetsSucceeded
      completedAt
      createdAt
      durationMs
      errorDetails
      errorMessage
      executionLog
      id
      organizationId
      startedAt
      status
      triggerEvent
      triggeredBy
      triggeredByUser
      updatedAt
      workflowRuleId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListWorkflowExecutionLogsQueryVariables,
  APITypes.ListWorkflowExecutionLogsQuery
>;
export const listWorkflowRules = /* GraphQL */ `query ListWorkflowRules(
  $filter: ModelWorkflowRuleFilterInput
  $limit: Int
  $nextToken: String
) {
  listWorkflowRules(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      actions
      createdAt
      createdBy
      description
      failedExecutions
      id
      isActive
      lastExecutionAt
      lastExecutionLog
      lastExecutionStatus
      lastModifiedAt
      lastModifiedBy
      lastRunAt
      name
      nextRunAt
      organizationId
      priority
      projectId
      schedule
      scope
      successfulExecutions
      totalExecutions
      triggerConditions
      triggerType
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListWorkflowRulesQueryVariables,
  APITypes.ListWorkflowRulesQuery
>;
export const universalSearch = /* GraphQL */ `query UniversalSearch($limit: Int, $query: String!) {
  universalSearch(limit: $limit, query: $query)
}
` as GeneratedQuery<
  APITypes.UniversalSearchQueryVariables,
  APITypes.UniversalSearchQuery
>;
