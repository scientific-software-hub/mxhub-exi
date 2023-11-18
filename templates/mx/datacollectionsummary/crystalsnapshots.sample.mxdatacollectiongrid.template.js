
<div class="col-xs-12 col-md-2">
    <a href="{.xtal1}"  data-lightbox="{.DataCollection_dataCollectionId}" data-title="{.Protein_acronym} : {.Protein_name}">
    <img id="xtal1_samples_{.DataCollection_dataCollectionId}" alt="Image not found" class="small" src="{.xtal1}"/>
    </a>
</div>
<div class="col-xs-12 col-md-2">
    {@eq key=showXtal2 value=1}
        <a href="{.xtal2}"  data-lightbox="{.DataCollection_dataCollectionId}" data-title="{.Protein_acronym} : {.Protein_name}">
            <img id="xtal2_samples_{.DataCollection_dataCollectionId}" alt="Image not found" class="small" src="{.xtal2}"/>
        </a>
    {:else}
        <img id="xtal2_samples_{.DataCollection_dataCollectionId}" alt="Image not found" src="../images/white_square.png"/>
    {/eq}
</div>
<div class="col-xs-12 col-md-2">
    {@eq key=showXtal3 value=1}
        <a href="{.xtal3}"  data-lightbox="{.DataCollection_dataCollectionId}" data-title="{.Protein_acronym} : {.Protein_name}">
            <img id="xtal3_samples_{.DataCollection_dataCollectionId}" alt="Image not found" class="small" src="{.xtal3}"/>
        </a>
    {:else}
        <img id="xtal3_samples_{.DataCollection_dataCollectionId}" alt="Image not found" src="../images/white_square.png"/>
    {/eq}
</div>
<div class="col-xs-12 col-md-2">
    {@eq key=showXtal4 value=1}
        <a href="{.xtal4}"  data-lightbox="{.DataCollection_dataCollectionId}" data-title="{.Protein_acronym} : {.Protein_name}">
            <img id="xtal4_samples_{.DataCollection_dataCollectionId}" alt="Image not found" class="small" src="{.xtal4}"/>
        </a>
    {:else}
        <img id="xtal4_samples_{.DataCollection_dataCollectionId}" alt="Image not found" src="../images/white_square.png"/>
    {/eq}
</div>
                        