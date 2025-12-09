import type { Schema } from '@/amplify/data/resource';

type CallSheet = Schema['CallSheet']['type'];
type CallSheetScene = Schema['CallSheetScene']['type'];
type CallSheetCast = Schema['CallSheetCast']['type'];
type CallSheetCrew = Schema['CallSheetCrew']['type'];

interface CallSheetPDFData {
  callSheet: CallSheet;
  scenes: CallSheetScene[];
  cast: CallSheetCast[];
  crew: CallSheetCrew[];
}

export function generateCallSheetPDF(data: CallSheetPDFData) {
  const { callSheet, scenes, cast, crew } = data;

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate PDF');
    return;
  }

  // Group crew by department
  const crewByDepartment: Record<string, CallSheetCrew[]> = {};
  crew.forEach(member => {
    const dept = member.department || 'Other';
    if (!crewByDepartment[dept]) {
      crewByDepartment[dept] = [];
    }
    crewByDepartment[dept].push(member);
  });

  // Generate HTML content
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Call Sheet - ${callSheet.productionTitle} - Day ${callSheet.shootDayNumber}</title>
  <style>
    @page {
      size: letter;
      margin: 0.5in;
    }

    @media print {
      body { margin: 0; padding: 0; }
      .page-break { page-break-before: always; }
      .no-print { display: none; }
    }

    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 10pt;
      line-height: 1.3;
      color: #000;
      margin: 0;
      padding: 20px;
    }

    .header {
      text-align: center;
      border-bottom: 3px solid #000;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }

    .header h1 {
      margin: 0 0 5px 0;
      font-size: 24pt;
      font-weight: bold;
      text-transform: uppercase;
    }

    .header h2 {
      margin: 0;
      font-size: 14pt;
      font-weight: normal;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 15px;
    }

    .info-section {
      border: 1px solid #000;
      padding: 8px;
    }

    .info-section h3 {
      margin: 0 0 5px 0;
      font-size: 11pt;
      font-weight: bold;
      border-bottom: 1px solid #ccc;
      padding-bottom: 3px;
    }

    .info-row {
      margin: 3px 0;
      display: flex;
    }

    .info-label {
      font-weight: bold;
      min-width: 120px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }

    th {
      background-color: #000;
      color: #fff;
      padding: 6px;
      text-align: left;
      font-size: 9pt;
      font-weight: bold;
    }

    td {
      border: 1px solid #ccc;
      padding: 5px;
      font-size: 9pt;
    }

    .section-title {
      background-color: #000;
      color: #fff;
      padding: 6px 10px;
      margin: 15px 0 5px 0;
      font-size: 12pt;
      font-weight: bold;
    }

    .footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 2px solid #000;
      font-size: 8pt;
      text-align: center;
    }

    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: #4F46E5;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14pt;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .print-button:hover {
      background: #4338CA;
    }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">🖨️ Print / Save PDF</button>

  <!-- Header -->
  <div class="header">
    <h1>${callSheet.productionTitle || 'Production Call Sheet'}</h1>
    <h2>Day ${callSheet.shootDayNumber} of ${callSheet.totalShootDays} | ${formatDate(callSheet.shootDate)}</h2>
  </div>

  <!-- Production Information -->
  <div class="info-grid">
    <div class="info-section">
      <h3>Production Information</h3>
      <div class="info-row">
        <span class="info-label">Company:</span>
        <span>${callSheet.productionCompany || 'N/A'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Episode:</span>
        <span>${callSheet.episodeNumber || 'N/A'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Crew Call:</span>
        <span>${callSheet.generalCrewCall || 'N/A'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Est. Wrap:</span>
        <span>${callSheet.estimatedWrap || 'N/A'}</span>
      </div>
    </div>

    <div class="info-section">
      <h3>Weather & Location</h3>
      <div class="info-row">
        <span class="info-label">Location:</span>
        <span>${callSheet.primaryLocation || 'N/A'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Weather:</span>
        <span>${callSheet.weatherForecast || 'N/A'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Temperature:</span>
        <span>${callSheet.temperature || 'N/A'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Sunset:</span>
        <span>${callSheet.sunset || 'N/A'}</span>
      </div>
    </div>
  </div>

  <!-- Key Contacts -->
  <div class="info-section" style="margin-bottom: 15px;">
    <h3>Key Production Contacts</h3>
    <div class="info-grid">
      ${callSheet.directorName ? `
      <div class="info-row">
        <span class="info-label">Director:</span>
        <span>${callSheet.directorName} - ${callSheet.directorPhone || ''}</span>
      </div>` : ''}
      ${callSheet.producerName ? `
      <div class="info-row">
        <span class="info-label">Producer:</span>
        <span>${callSheet.producerName} - ${callSheet.producerPhone || ''}</span>
      </div>` : ''}
      ${callSheet.firstADName ? `
      <div class="info-row">
        <span class="info-label">1st AD:</span>
        <span>${callSheet.firstADName} - ${callSheet.firstADPhone || ''}</span>
      </div>` : ''}
      ${callSheet.productionManagerName ? `
      <div class="info-row">
        <span class="info-label">Prod. Manager:</span>
        <span>${callSheet.productionManagerName} - ${callSheet.productionManagerPhone || ''}</span>
      </div>` : ''}
    </div>
  </div>

  <!-- Scenes -->
  ${scenes.length > 0 ? `
  <div class="section-title">SCENES</div>
  <table>
    <thead>
      <tr>
        <th style="width: 60px;">Scene</th>
        <th style="width: 80px;">Int/Ext</th>
        <th>Description</th>
        <th style="width: 80px;">Time</th>
        <th style="width: 80px;">Pages</th>
        <th style="width: 100px;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${scenes.map(scene => `
      <tr>
        <td>${scene.sceneNumber || ''}</td>
        <td>${scene.intExt || ''}</td>
        <td>${scene.description || ''}</td>
        <td>${scene.scheduledTime || ''}</td>
        <td>${scene.pageCount || ''}</td>
        <td>${scene.status || 'SCHEDULED'}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  <!-- Cast -->
  ${cast.length > 0 ? `
  <div class="section-title">CAST</div>
  <table>
    <thead>
      <tr>
        <th>Actor</th>
        <th>Character</th>
        <th>Makeup</th>
        <th>Wardrobe</th>
        <th>Call to Set</th>
        <th>Pickup</th>
      </tr>
    </thead>
    <tbody>
      ${cast.map(member => `
      <tr>
        <td>${member.actorName || ''}</td>
        <td>${member.characterName || ''}</td>
        <td>${member.makeupCall || '-'}</td>
        <td>${member.wardrobeCall || '-'}</td>
        <td><strong>${member.callToSet || '-'}</strong></td>
        <td>${member.pickupTime ? `${member.pickupTime}${member.pickupLocation ? ' - ' + member.pickupLocation : ''}` : '-'}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
  ` : ''}

  <!-- Crew by Department -->
  ${Object.keys(crewByDepartment).length > 0 ? `
  <div class="section-title">CREW</div>
  ${Object.entries(crewByDepartment).map(([dept, members]) => `
    <div style="margin-bottom: 10px;">
      <h4 style="margin: 5px 0; font-size: 10pt; font-weight: bold;">${dept}</h4>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Call Time</th>
            <th>Walkie</th>
            <th>Contact</th>
          </tr>
        </thead>
        <tbody>
          ${members.map(member => `
          <tr>
            <td>${member.name || ''}</td>
            <td>${member.role || ''}</td>
            <td>${member.callTime || '-'}</td>
            <td>${member.walkieChannel || '-'}</td>
            <td>${member.contactPhone || member.contactEmail || '-'}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `).join('')}
  ` : ''}

  <!-- Additional Information -->
  ${callSheet.specialInstructions || callSheet.safetyNotes || callSheet.mealTimes ? `
  <div class="page-break"></div>
  <div class="section-title">ADDITIONAL INFORMATION</div>
  <div class="info-section">
    ${callSheet.mealTimes ? `
    <div class="info-row" style="margin-bottom: 8px;">
      <span class="info-label">Meal Times:</span>
      <span>${callSheet.mealTimes}</span>
    </div>` : ''}
    ${callSheet.safetyNotes ? `
    <div class="info-row" style="margin-bottom: 8px;">
      <span class="info-label">Safety Notes:</span>
      <span>${callSheet.safetyNotes}</span>
    </div>` : ''}
    ${callSheet.specialInstructions ? `
    <div class="info-row" style="margin-bottom: 8px;">
      <span class="info-label">Special Instructions:</span>
      <span>${callSheet.specialInstructions}</span>
    </div>` : ''}
    ${callSheet.transportationNotes ? `
    <div class="info-row" style="margin-bottom: 8px;">
      <span class="info-label">Transportation:</span>
      <span>${callSheet.transportationNotes}</span>
    </div>` : ''}
    ${callSheet.nextDaySchedule ? `
    <div class="info-row" style="margin-bottom: 8px;">
      <span class="info-label">Next Day:</span>
      <span>${callSheet.nextDaySchedule}</span>
    </div>` : ''}
  </div>
  ` : ''}

  <!-- Emergency Contacts -->
  ${callSheet.nearestHospital ? `
  <div class="section-title" style="background-color: #DC2626;">EMERGENCY CONTACTS</div>
  <div class="info-section">
    <div class="info-row">
      <span class="info-label">Nearest Hospital:</span>
      <span>${callSheet.nearestHospital}</span>
    </div>
    ${callSheet.hospitalAddress ? `
    <div class="info-row">
      <span class="info-label">Address:</span>
      <span>${callSheet.hospitalAddress}</span>
    </div>` : ''}
    <div class="info-row">
      <span class="info-label">Production Office:</span>
      <span>${callSheet.productionOfficePhone || 'N/A'}</span>
    </div>
  </div>
  ` : ''}

  <div class="footer">
    Generated by SyncOps | ${new Date().toLocaleString()} | Call Sheet ID: ${callSheet.id?.substring(0, 8)}
  </div>

  <script>
    // Auto-focus print dialog after page loads
    window.onload = function() {
      setTimeout(function() {
        // window.print(); // Uncomment to auto-open print dialog
      }, 500);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return 'TBD';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}
