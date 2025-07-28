import React from 'react'

export const TechnicalDocumentation = () => {
  return (
    <div className="card" style={{ width: '700px', minHeight: '500px' }}>
        <object data="SoilFerApp_UserGuide.pdf" type="application/pdf" width="100%" height="500px">
        <p><a href="SoilFerApp_UserGuide.pdf">Download the SoilFER App User Guide here.</a></p>
        </object>
    </div>
  )
}