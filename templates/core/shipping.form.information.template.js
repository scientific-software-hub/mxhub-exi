<div class="form-group row" style="margin:0px; display: flex; gap: 20px; align-items: flex-start;">
    <!-- Group 1 -->
    <div class="col-md-3" style="padding:0px">
        <table class="table">
            <tr><td>Name</td><td class='column_parameter_value'>{shipment.shippingName}</td></tr>
            <tr><td>Beamline</td><td class='column_parameter_value'>{beamlineName}</td></tr>
            <tr><td>From</td><td class='column_parameter_value'>{.shipment.sendingLabContactVO.cardName}</td></tr>
            <tr>
                <td>Return address</td>
                <td class='column_parameter_value'>
                    {? shipment.returnLabContactVO}
                    {shipment.returnLabContactVO.cardName}
                    {:else}
                    NO RETURN
                    {/shipment.returnLabContactVO}
                        </td>
                        </tr>
                        </table>
                        </div>

                        <!-- Group 2 -->
                        <div class="col-md-2" style="padding:0px">
                        <table class="table">
                        <tr><td>Date</td><td class='column_parameter_value'>{startDate}</td></tr>
            <tr><td>Status</td><td class='column_parameter_value'><kbd style='background-color:#207a7a;'>{.shipment.shippingStatus}</kbd></td></tr>
            <tr><td>Courier company</td><td class='column_parameter_value'>{.shipment.returnLabContactVO.defaultCourrierCompany}</td></tr>
            <tr><td>Shipping Reference</td>
                <td class='column_parameter_value'> {? fedexCode}
                <kbd style="background-color:#207a7a;">{.fedexCode}</kbd>
                {/fedexCode}
                </td>
            </tr>
        </table>
    </div>

    <!-- Group 3: Buttons  -->
    <div class="col-md-6">
                    <table class="table">
                    <tr>
                    <!-- Left Column: Comments -->
                    <td style="vertical-align: top; width: 50%;">
                    <label><b>Comments:</b></label>
                    <textarea class="form-control disabled" rows="4" style="margin-top: 10px;">{shipment.comments}</textarea>
            </td>

            <!-- Right Column: Buttons -->
            <td style="vertical-align: top; width: 50%;">
                <!-- Status Button -->
                <div style="margin-bottom: 10px;">
                    <a id="{id}-send-button">
                        <button class="btn btn-primary btn-md" style="height: 50px;">{statusButtonLabel}</button>
                    </a>
                </div>

                <!-- Optional Warning -->
                {@eq key=hidePrintLabelWarning value="false" type="boolean"}
                <div class="alert alert-warning" style="font-size: 12px; max-width: 300px; margin-bottom: 10px; padding: 8px;">
                    <strong><span class="glyphicon glyphicon-alert"></span></strong>
                    <span style="margin-left: 10px;">One of your labels is not printed</span>
                </div>
                {/eq}

                    <!-- Edit and Delete Buttons Side-by-Side -->
                    <div style="margin-top: 10px;">
                    <button id="{id}-edit-button" class="btn btn-primary btn-md disabled" style="height: 50px; margin-right: 20px;">Edit</button>
                    <button id="{id}-delete-button" class="btn btn-primary btn-md disabled" style="height: 50px;">Delete</button>
                    </div>
                    </td>
                    </tr>
                    </table>
</div>
</div>