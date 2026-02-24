<div class="container-fluid">
    <table class="table">
        <thead class="table-fixed ">
        <tr>
            <td>
                Start
            </td>
            <td>
                Beamline
            </td>
            <td>
                Proposal
            </td>
            <td>
                Beamtime ID
            </td>
            <td class='sessiongrid-a-form-header2'>
                Title
            </td>
            <td>
                Local Contact
            </td>
            <td style="text-align:center;" class="mxsessiongridheader">
                En. Scans
            </td>
            <td style="text-align:center;" class="mxsessiongridheader">
                XRF
            </td>
            <td style="text-align:center;" class="mxsessiongridheader">
                Samples
            </td>
            <td style="text-align:center;" class="mxsessiongridheader">
                Tests
            </td>
            <td style="text-align:center;" class="mxsessiongridheader">
                Collects
            </td>
            <td style="text-align:center;">
                Time of the 1st dataset
            </td>
            <td style="text-align:center;">
                Time of the last dataset
            </td>
            <td style="text-align:center;">
                Total Time
            </td>
            <td style='width:380px;'>
                Comments
            </td>
        </tr>
        </thead>
        <tbody class="table-fixed">
        {#.}
        {@gt key=totalDataCollectionCount value=0}
        <tr>
            {:else}
            <tr class='sessiongrid-no-data-collections'>
                {/gt}
                    <td> <a href='{.dataCollectionURL}'>{@formatDate date=BLSession_startDate format="MM/DD/YYYY" /}</a>
        </td>
        <td><a href='{.dataCollectionURL}'>{.beamLineName}</a></td>
        <td><a href='{.dataCollectionURL}'>
            <?BLSession_protectedData>
            {@eq key=BLSession_protectedData value="OK"}
            <span class="glyphicon glyphicon-lock"></span>
            {/eq}
                </BLSession_protectedData>
                <a href='{.dataCollectionURL}'>
            {@eq key=showProposalType value="true" type="boolean"}{.Proposal_proposalCode}{/eq}{.Proposal_ProposalNumber} </a>
            </td>
            <td>
            <span id="sessionId_{.sessionId}">{.sessionId}</span>
        </td>
        <td class='sessiongrid-a-form-header2' style='color: gray !important;'>
            <?BLSession_protectedData>
            {.Proposal_title}
        </td>
        {@eq key=BLSession_protectedData value="OK"}
        <span class="glyphicon glyphicon-lock"></span>
        {/eq}
        </BLSession_protectedData>
    </td>
    <td> {.beamLineOperator}</td>
    <td class="mxsessiongridcell">
        <div style="text-align:center;">
            {@gt key=energyScanCount value=0}
            <span style="background-color:#207a7a;" class="badge">{.energyScanCount}</span>
            {/gt}
                </div>
                </td>
                <td class="mxsessiongridcell">
                <div style="text-align:center;">
            {@gt key=xrfSpectrumCount value=0}
            <span style="background-color:#207a7a;" class="badge">{.xrfSpectrumCount}</span>
            {/gt}
                </div>
                </td>
                <td class="mxsessiongridcell">
                <div style="text-align:center;">
            {@gt key=sampleCount value=0}
            <span style="background-color:#207a7a;" class="badge">{.sampleCount}</span>
            {/gt}
                </div>
                </td>
                <td class="mxsessiongridcell">
                <div style="text-align:center;">
            {@gt key=testDataCollectionGroupCount value=0}
            <span style="background-color:#207a7a;" class="badge">{.testDataCollectionGroupCount}</span>
            {/gt}
                </div>
                </td>
                <td class="mxsessiongridcell">
                <div style="text-align:center;">
            {@gt key=dataCollectionGroupCount value=0}

            <span style="background-color:#207a7a;" class="badge">{.dataCollectionGroupCount}</span>

            {/gt}
            </div>
        </td>

        <td class="mxsessiongridcell">
            <div style="text-align:center;">
                <span>{#firstStartTimeDataCollectionGroup}{@formatDateTime value=firstStartTimeDataCollectionGroup /}{/firstStartTimeDataCollectionGroup}</span>
            </div>
        </td>

        <td >
            <div style="text-align:center;">
                <span> {#lastEndTimeDataCollectionGroup}
                    {@formatDateTime value=lastEndTimeDataCollectionGroup /}
                    {/lastEndTimeDataCollectionGroup}
                    </span>
            </div>
        </td>
        <td >
            <div style="text-align:center;">
             <span>{#firstStartTimeDataCollectionGroup} {#lastEndTimeDataCollectionGroup}
            {@calculateDuration start=firstStartTimeDataCollectionGroup end=lastEndTimeDataCollectionGroup /}
            {/lastEndTimeDataCollectionGroup}{/firstStartTimeDataCollectionGroup}
            </span>
            </div>
        </td>
        <td class="mxsessiongridcell" style='width:400px;'>
            <div style="width:390px; wordWrap: break-word;">
                <a class="btn btn-xs"><span id="{.sessionId}-edit-comments" class="glyphicon glyphicon-edit session-comment-edit"></span></a>
                <span id="comments_{.sessionId}">{.comments}</span>
            </div>
        </td>
    </tr>
    {/.}
</tbody>
</table>
</div>