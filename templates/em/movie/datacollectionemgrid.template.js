

 {#.}  
   
   <div class="panel with-nav-tabs panel-default">
      <div class="panel-heading clearfix">
            <div class="pull-left">       
               <kbd style='background-color:#CCCCCC;color:blue;'>Movie #{.Movie_movieNumber}</kbd>  
               <span style='color:blue;'>{@formatDate date=.Movie_createdTimeStamp format="DD-MM-YYYY HH:mm:ss" /}</span>                       
            </div>
            <div class="pull-right">
                
                        <a  href='{.mrcURL}' target='_blank'>
                          Instrument MRC <span class=" glyphicon glyphicon-download-alt"> </span>
                       </a>  

                       <a  href='{.metadataXMLURL}' target='_blank'>
                           XML <span class=" glyphicon glyphicon-download-alt"> </span>
                       </a>                                                     
            </div>
       </div>
   

 <div class="tab-content">
<div class="container-fluid" >
   <div class="row">
          <div class="col-sm-2 text-center" > <kbd style='background-color:green'>Movie</kbd>
          </div>
           <div class="col-sm-6 text-center" >
                {?MotionCorrection_motionCorrectionId}
                   <kbd style='background-color:blue'>Motion Correction</kbd>
               {/MotionCorrection_motionCorrectionId}
          </div>
                
                 <div class="col-sm-2 text-center"  >
                 {?CTF_CTFid}<kbd>CTF</kbd> {/CTF_CTFid}
                
          </div>

   </div>
 
   <div class="row">
 
      <div class="col-sm-2">
         <table class="table">
            <tr>
               <td>Number</td>
               <td class='column_parameter_value'>{.Movie_movieNumber}</td>
            </tr>
            <tr>
               <td>X, Y</td>
               <td class='column_parameter_value'>{@decimal key="Movie_positionX" decimals=6 /}, {@decimal key="Movie_positionY" decimals=6 /}</td>
            </tr>
         </table> 
      </div>
       <div class="col-sm-1">
           <a href="{.micrographThumbnailURL}" data-lightbox='{.micrographThumbnailURL}' data-title="Movie number #{.Movie_movieNumber}">
                <img  src="{.micrographThumbnailURL}" class='img-thumbnail img-responsive' data-src="{.xtal1}"/>                  
            </a>            
       </div>
      
       
      <div class="col-sm-2">
        {?MotionCorrection_motionCorrectionId}
         <table class="table">
            <tr>
               <td>Total Motion</td>
               <td class='column_parameter_value'>{.MotionCorrection_totalMotion}</td>
            </tr>
            <tr>
               <td>Avg. Motion/frame</td>
               <td class='column_parameter_value'>{.MotionCorrection_averageMotionPerFrame}</td>
            </tr>
           <tr>
               <td>Frame Range</td>
               <td class='column_parameter_value'>{.MotionCorrection_firstFrame} - {.MotionCorrection_lastFrame}</td>
            </tr>
                      
            <tr>
               <td>Dose</td>
               <td class='column_parameter_value'>{@decimal key="MotionCorrection_dosePerFrame" decimals=4 /}</td>
            </tr>
          
         </table>
          {/MotionCorrection_motionCorrectionId}
      </div>

       <div class="col-sm-1">
            {?MotionCorrection_motionCorrectionId}
             <a href="{.motionCorrectionDriftURL}" data-lightbox='{.motionCorrectionDriftURL}' data-title="Movie number #{.Movie_movieNumber}">
                <img  src="{.motionCorrectionDriftURL}" class='img-thumbnail img-responsive' data-src="{.xtal1}"/>                  
            </a>  

               
            {/MotionCorrection_motionCorrectionId}
                            
       </div>
        <div class="col-sm-1">              
            {?MotionCorrection_motionCorrectionId}
              
               
                <a href="{.motionCorrectionThumbnailURL}" data-lightbox='{.motionCorrectionThumbnailURL}' data-title="Movie number #{.Movie_movieNumber}">
                    <img  src="{.motionCorrectionThumbnailURL}" class='img-thumbnail img-responsive' data-src="{.xtal1}"/>                  
                </a>            
             {/MotionCorrection_motionCorrectionId}
       </div>

      <div class="col-sm-2">
        {?CTF_CTFid}
         <table class="table">
            <tr>
               <td>Resolution Limit</td>
               <td class='column_parameter_value'>{.CTF_resolutionLimit}</td>
            </tr>
          
            <tr>
               <td>Correlation</td>
               <td class='column_parameter_value'>{.CTF_crossCorrelationCoefficient}</td>
            </tr>
           <tr>
               <td>Defocus U</td>
                 <td class='column_parameter_value'>{@decimal key="CTF_defocusU" decimals=2 /}</td>
            </tr>
            <tr>
               <td>Defocus  V</td>
                 <td class='column_parameter_value'>{@decimal key="CTF_defocusV" decimals=2 /}</td>
            </tr>
           
            
          
         </table>
          {/CTF_CTFid}
      </div>
     
       <div class="col-sm-1">
           {?CTF_CTFid}
             <table class="table">
           
            <tr>
               <td>Angle</td>
               <td class='column_parameter_value'>{.CTF_angle}</td>
            </tr>
           
            <tr>
               <td>Estimated B factor</td>
               <td class='column_parameter_value'>{.CTF_estimatedBfactor}</td>
            </tr>
            
          
         </table>

           
            {/CTF_CTFid}
       </div>

        <div class="col-sm-1">
           {?CTF_CTFid}
                <a href="{.ctfSpectraURL}" data-lightbox='{.ctfSpectraURL}' data-title="Movie number #{.Movie_movieNumber}">
                    <img  src="{.ctfSpectraURL}" class='img-thumbnail img-responsive' data-src="{.xtal1}"/>                  
                </a> 

           
            {/CTF_CTFid}
       </div>


      
   </div>
   </div>
   </div>

   </div>
   {/.} 

</div>
