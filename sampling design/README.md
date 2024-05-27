# Soil Sampling Design
Guidelines and Technical Manual for Soil Sampling Design in SoilFER.

This folder contains the material to produce a Soil Sampling Design, taking information from Honduras as an example, using the three-stage sample procedure proposed at Soils4Africa.Access to the Soils4Africa sampling design protocol: [https://www.soils4africa-h2020.eu/serverspecific/soils4africa/images/Documents/Soils4Africa_D3.2B_Sampling_design_v01.pdf] modified with the inclusion of a 'Covariate Space Coverage' sampling approach at the Primary Sampling Unit (PSU) level.

The environmental covariates for Honduras must be retrieved either from GGE using the code in gee.txt or from the following link:

https://www.dropbox.com/scl/fi/9qmks5aq4hdgubnskyw35/covariates_HND.tif?rlkey=p9eav54m697cg6h8map6hw5dc&dl=0

The covariates regarding soil climate for Honduras must be retrieved from the following link:

https://www.dropbox.com/scl/fi/nm4z0t43fy7mfs1524jpm/newhall.tif?rlkey=8w8xy358hsln0j556hmlusii2&dl=0

Landuse layer is composed of a single raster delineating the location of "Coffee/African Palm/Banana/Sugarcane" crops. This is a layer for running only this example. 

Note that the three raster files (coffee_2018.tif, covariates_HND.tif and newhall.tif) must be stored in the '/data/raster' folder or change the correspoinding path in the R script.  

The R code is in both 'R' and 'Rmd' files within the '/scripts' folder.
