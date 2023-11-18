<table id="{id}-frames-table" class="table table-hover small-padding-rows">
    {#.}
        <tr>
            <td id='{.domId}' class="frame-cell-element" style="cursor:pointer">
                <span class="unselectable-text" style="pointer-events:none;">
                 
                 {@fileName key="filePath" /}        
                </span>
                {?.discarded}<span class="unselectable-text" style="color:red;pointer-events:none;"> (discarded)</span>{/.discarded}
            </td>
        <tr> 
    {/.}
</table> 