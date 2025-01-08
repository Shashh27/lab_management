

const DOCUMENT_TEMPLATES = [
    {
      id: 'blank',
      title: 'Blank Template',
      description: 'Start with an empty document',
      content: '',
    },
    {
      id: 't1',
      title: 'Template 1 - Coating Thickness Measurement',
      description: '',
      content: `
    
    <center><h2>Coating Thickness Measurement</h2></center>
  
    &nbsp;  
    &nbsp;  
  
    
    Report No & Date        :\n
    Name & Address         :\n
    Ref. & Date           :\n
    Sample Received on    :\n
    Testing completed on  :\n
    Sample Description    :\n
    No. Of Samples       :\n
    Test Procedure       :\n
  
  &nbsp;  
  
  <h3>Results:<h3>
  
  &nbsp;  
  &nbsp;  
  
  | Sl.no | Sample ID | Reading 1 (μm) | Reading 2 (μm) | Reading 3 (μm) | Avg. Value (μm) |
  |-------|-----------|----------------|----------------|----------------|-----------------|
  | 01    |           |                |                |                |                 |
  | 02    |           |                |                |                |                 |
  | 03    |           |                |                |                |                 |
  
  &nbsp;  
  &nbsp;  
  
  <footer>
      [Insert microscope image analysis here]  
      <p>Fig: 01 Image of coating thickness measurement, viewed at 500x mag.</p>
    </footer>`
    },
    {
      id: 't2',
      title: 'Template 2 - Hardness Measurement',
      description: '',
      content: `
  
    <center><h2>Hardness Measurement</h2></center>
  
    &nbsp;  
    &nbsp;  
  
  Report No & Date       :\n
  Name & Address         :\n
  Ref. & Date            :\n
  Sample Received on     :\n
  Testing completed on   :\n
  Sample Description     :\n
  No. Of Samples         :\n
  Test Procedure         :\n
  
    &nbsp;  
  
  <h3>Results:<h3>
  
    &nbsp;  
    &nbsp;  
  
  
  | Sl.no | Sample ID |  1st Value     |   2nd Value    |   3rd Value    |
  |-------|-----------|----------------|----------------|----------------|
  | 01    |           |                |                |                |
  | 02    |           |                |                |                |
  | 03    |           |                |                |                |
  
    `
    },
    {
      id: 't3',
      title: 'Template 3 - ULTRASONIC TEST',
      description: '',
      content: `
  
    <center><h2>ULTRASONIC TEST</h2></center>
  
    &nbsp;  
    &nbsp;  
  
  Report No & Date       :\n
  Name & Address         :\n
  Ref. & Date            :\n
  Quantity               :\n
  Testing Procedure      :\n
  Transducer size and frequency     :\n
  Calibration Standard   :\n
  Couplant Used          :\n
  Setting of Apparatus   :\n
  Environment            :\n
  Acceptance Standard    :\n
  
  
    &nbsp;  
  
  <h3>Results:<h3>
  
    &nbsp;  
    &nbsp;  
  
  
  | Sl.no | Description |  Observation   |    Remarks     |
  |-------|-------------|----------------|----------------|
  | 01    |             |                |                |
  | 02    |             |                |                |
  | 03    |             |                |                |
  
    `
    },
    {
      id: 't4',
      title: 'Template 4 - Particle count & Distribution analysis',
      description: '',
      content: `
  
    <center><h2>Particle count & Distribution analysis</h2></center>
  
    &nbsp;  
    &nbsp;  
  
  Report No & Date       :\n
  Name & Address         :\n
  Ref. & Date            :\n
  Sample Received on     :\n
  Testing completed on   :\n
  Sample Description     :\n
  No. Of Samples         :\n
  Type of inspection     :\n
  Test Procedure         :\n
  
    &nbsp;  
  
  <h3>Results:<h3>
  
    &nbsp;  
    &nbsp;  
  
  
  | Sl.no | Particle Range | Metallic Particle | Non-Metalic particle | Total Particle Count |
  |-------|----------------|-------------------|----------------------|----------------------|
  | 01    |                |                   |                      |                      |
  | 02    |                |                   |                      |                      |
  | 03    |                |                   |                      |                      |
  | 04    |                |                   |                      |                      |
  | 05    |                |                   |                      |                      |
  | 06    |                |                   |                      |                      |
  | 07    |                |                   |                      |                      |
  | 08    |                |                   |                      |                      |
  | 09    |                |                   |                      |                      |
  | 10    |                |                   |                      |                      |
  
    `
    },
    
  ];

export default DOCUMENT_TEMPLATES;
