<form class="form-horizontal" role="form">
	<div class="form-group">
		<label class="col-sm-4 control-label">Estado de conservaci&acute;n</label>
		<div class="col-sm-8">
			<select class="form-control" id="estado_cons" name="estado_cons">
				<option value="BUE">Bueno</option>
				<option value="REG">Regular</option>
				<option value="MAL">Malo</option>
			</select>
		</div>
	</div>
	<div class="form-group">
		<label class="col-sm-4 control-label">Estado</label>
		<div class="col-sm-8">
			<select class="form-control" id="estado_cons" name="estado_cons">
				<option value="OCU">Ocupado</option>
				<option value="DES">Desocupado</option>
			</select>
		</div>
		<div style="display:none;" id="select_ocup" name="select_ocup">
		<!-- <div style="display:none;" id="select_ocup" name="select_ocup"> -->
			<label class="col-sm-4 control-label">Estado de ocupaci&oacute;n</label>
			<div class="col-sm-8">
				<select class="form-control" id="estado_ocup" name="estado_ocup">
					<option value="ADC">Acta de conciliaci&oacute;n</option>
					<option value="AUT">Autorizaci&oacute;n</option>
					<option value="NCO">Nuevo Contrato</option>
					<option value="REN">Renovaci&oacute;n</option>
					<option value="SCO">Sin Contrato</option>
					<option value="CNV">Convenio</option>
					<option value="CMD">Comodato</option>
				</select>
			</div>

		</div>
	</div>
	<div class="form-group">
		<label class="col-sm-4 control-label">Situaci&oacute;n Legal</label>
		<div class="col-sm-8">
			<select class="form-control" id="estado_situ" name="estado_cons">
				<option value="SAN">Saneado</option>
				<option value="NOS">No Saneado</option>
			</select>
		</div>
		<div id="form_sane" name="form_sane">
		<!-- <div style="display:none;" id="form_sane" name="form_sane"> -->
			<label class="col-sm-4 control-label">Estado de Sameamiento</label>
			<div class="col-sm-8">
				<div class="row">
					<label for="asiento">Asiento *</label>
					<input id="asiento" name="asiento" type="text" required>
				</div>
				<div class="row">
					<label for="hoja">Hoja *</label>
					<input id="hoja" name="hoja" type="text" required>
				</div>
				<div class="row">
					<label for="tomo">Tomo *</label>
					<input id="tomo" name="tomo" type="text" required>
				</div>
				<div class="row">
					<label for="ficha_partida">Ficha o Partida *</label>
					<input id="ficha_partida" name="ficha_partida" type="text" required>
				</div>
			</div>
		</div>
		<div id="form_nosane" name="form_nosane">
		<!-- <div style="display:none;" id="form_sane" name="form_sane"> -->
			<label class="col-sm-4 control-label">Situaci&oacute;n no legal de Saneamiento</label>
			<div class="col-sm-8">
				<div class="row">
					<label for="modalidad">Modelamiento de Saneamiento Requerido *</label>
					<input id="modalidad" name="modalidad" type="text" required>
				</div>
			</div>
		</div>
	</div>
</form>