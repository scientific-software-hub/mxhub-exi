<div id='{.id}' style='height:{height}px;{?enableClick}cursor:pointer;{/enableClick}'>
    <div id='{.id}-img' pointer-events='none' class='stock-solution' style="height:{height}px;">
        {?fillPanel}
            <table class="table">
                <tr valign="middle">
                    <td style="border-bottom:1px solid;"><b>
                        {@eq key=code value=""}
                            &nbsp;-
                        {:else}
                            {code}
                        {/eq}</b>
                    </td>
                </tr>
                <tr>
                    <td>{macromoleculeAcronym}</td>
                </tr>
                <tr>
                    <td>{buffer}</td>
                </tr>
            </table>
        {/fillPanel}
    </div>
</div>