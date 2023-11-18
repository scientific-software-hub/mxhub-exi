<div class="Section1">
    <table id='hrdftrtbl' border='1' cellspacing='0' cellpadding='0'>
        <tr>
            <td>
                <div style='mso-element:header' id="h1" >
                    <p class="MsoHeader">
                        <table border="0" width="100%">
                            <tr>
                                <td>
                                    Data Collections for Proposal: {proposal.Proposal_proposalCode}{proposal.Proposal_proposalNumber} on Beamline: {session.beamLineName}  ---  Session start date: {@formatDate date=session.BLSession_startDate format="DD-MM-YYYY" /}
                                </td>
                            </tr>
                        </table>
                    </p>
                </div>
            </td>
        </tr>
    </table>
</div>

<h4>Session comments:</h4>
<p>{session.comments}</p>

<h4>Data Collections:</h4>

{>"datacollections.report.template"  /}

<h4>Energy Scans:</h4>

{?energyScans}
{>"energyscans.report.template"  /}
{:else}
<p>There is no energy scan in this report</p>
{/energyScans}

<h4>XRF Spectra:</h4>

{?xfeScans}
{>"xfescans.report.template"  /}
{:else}
<p>There is no XRF spectra in this report</p>
{/xfeScans}