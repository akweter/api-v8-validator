/* eslint-disable */
const InvoiceTemplate = ({ data }) => {

	const {
		distributor_tin,
		message: {
			num,
			ysdcid,
			ysdcrecnum,
			ysdcintdata,
			ysdcregsig,
			ysdcmrc,
			ysdcmrctim,
			flag,
			ysdcitems
		},
		qr_code,
		currency,
		totalLevy,
		userName,
		calculationType,
		totalVat,
		transactionDate,
		totalAmount,
		businessPartnerName,
		businessPartnerTin,
		discountAmount,
		items,
	} = data;
	
	let getfund = 0, nhil = 0, covid = 0, cst = 0, tourism = 0;

	if (Array.isArray(items) && items.length > 0) {
		items.forEach(item => {
			getfund += item.levyAmountB || 0;
			nhil += item.levyAmountA || 0;
			covid += item.levyAmountC || 0;
			cst += item.levyAmountD || 0;
			tourism += item.levyAmountE || 0;
		});
	}

	return (
		<div>
			<table align="center" border={0} width='100%' cellPadding={8}>
				<tr>
					<td>
						<big style={{ fontSize: 23 }}>
							Sample Invoice
						</big>
						<address>
							jamesakweter.tech <br />
						</address>
						<h1>{flag}</h1>
					</td>
					<td><img src={''} width={100} height={85} alt="Company Logo" /></td>
				</tr>
			</table>

			<table cellSpacing="2" cellPadding="2" align="left" width="100%">
				<thead style={{ alignContent: 'start' }}>
					<tr>
						<td><strong>BILL TO</strong></td>
						<td><strong>PAYABLE TO</strong></td>
						<td><strong>INVOICE #</strong></td>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>{businessPartnerName}</td>
						<td>EXAMPLE COMPANY LIMITED</td>
						<td>{num}</td>
					</tr>
					<tr>
						<td>{businessPartnerTin}</td>
						<td>{distributor_tin}</td>
						<td>{transactionDate}</td>
					</tr>
					<tr>
						<td></td>
						<td>SERVED BY:</td>
						<td>{userName}</td>
					</tr>
				</tbody>
			</table>

			{/* display products */}
			<table width='100%' border={0}>
				{
					Array.isArray(items) && items.length > 0 ?
						(
							<table border="1" cellSpacing="0" cellPadding="4" width="100%" color="lightgray">
								<thead>
									<tr>
										<th>Description</th>
										<th>Qty</th>
										<th>Price</th>
										<th>Total</th>
									</tr>
								</thead>
								<tbody>
									{items.map((product, index) => (
										<tr key={index}>
											<td>{product.description}</td>
											<td align="center">{product.quantity}</td>
											<td align="center">{Number(product.unitPrice).toFixed(2)}</td>
											<td align="center">{Number((product.quantity) * (product.unitPrice)).toFixed(2)}</td>
										</tr>
									))}
								</tbody>
							</table>
						) :
						(<div>Products not available</div>)
				}
			</table>

			{/* Display VAT & Levies */}

			<table cellSpacing="0" cellPadding="4" width="100%">
				<thead>
					{
						Number(totalAmount) !== Number(totalAmount - discountAmount) ? 
						<tr>
							<td width="60%" />
							<td width="20%" align="left">GROSS</td>
							<td width="20%" >{currency}: {Number(totalAmount)}</td>
						</tr> : null
					}
					{
						Number(discountAmount) ?
						<tr>
							<td width="60%" />
							<td width="20%" align="left">DISCOUNT</td>
							<td width="20%" >{currency}: {Number(discountAmount)}</td>
						</tr> : null
					}
						<tr>
							<td width="60%" />
							<td width="20%" align="left">GETFUND (2.5%)</td>
							<td width="20%" >{currency}: {getfund.toFixed(2)}</td>
						</tr>
						<tr>
							<td width="60%" />
							<td width="20%" align="justify">NHIL (2.5%)</td>
							<td width="20%">{currency}: {nhil.toFixed(2)}</td>
						</tr>
						<tr>
							<td width="60%" />
							<td width="20%" align="left">COVID (1%)</td>
							<td width="20%" >{currency}: {covid.toFixed(2)}</td>
						</tr>
						{Number(cst) ?
							(<tr>
								<td width="60%" />
								<td width="20%" align="left">CST (5%)</td>
								<td width="20%" >{currency}: {cst.toFixed(2)}</td>
							</tr>) : null
						}
						{tourism ?
							(<tr>
								<td width="60%" />
								<td width="20%" align="left">TOURISM (1%)</td>
								<td width="20%" >{currency}: {tourism.toFixed(2)}</td>
							</tr>) : null
						}
						<tr>
							<td width="60%" />
							<td width="20%" align="left">VAT (15%)</td>
							<td width="20%" >{currency}: {totalVat}</td>
						</tr>
						
					<tr style={{ border: "12px" }}>
						<td width="60%" />
						<td width="20%" align="left"><strong>NET TOTAL</strong></td>
						<td width="20%">
							<strong>
								{
									calculationType === "EXCLUSIVE" ?
									currency+":"+ ((
										Number(totalAmount) + 
										Number(totalVat) + 
										Number(totalLevy)
									) - discountAmount).toFixed(2) :
									currency+": "+ (
										Number(totalAmount - discountAmount)
									).toFixed(2)
								}
							</strong>
						</td>
					</tr>
				</thead>
			</table>
			
			<table >
				{
					qr_code && ysdcid ? <>
						<table cellSpacing="0" cellPadding="4" width="100%" align="left">
							<tbody>
								<tr>
									<td colSpan={3}>
										SDC INFORMATION
										<hr />
									</td>
								</tr>
								<tr>
									<td>SDC ID:</td>
									<td>{ysdcid}</td>
									<td rowSpan="7">
										<img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr_code)}`} alt="qr code" width={160} height={160} />
									</td>
								</tr>
								<tr>
									<td>Item Count:</td>
									<td>{ysdcitems}</td>
								</tr>

								<tr>
									<td>Rceipt Number:</td>
									<td>{ysdcrecnum}</td>
								</tr>
								<tr>
									<td>Timestamp:</td>
									<td>{ysdcmrctim}</td>
								</tr>
								<tr>
									<td>MRC</td>
									<td>{ysdcmrc}</td>
								</tr>
								<tr>
									<td>Internal Data:</td>
									<td>{ysdcintdata}</td>
								</tr>
								<tr>
									<td>Signature</td>
									<td>{ysdcregsig}</td>
								</tr>
							</tbody>
						</table>
					</> : null
				}
				<p />
				<hr />
				<p />

				<small style={{ position: "absolute", bottom: 0, left: 0, right: 0, textAlign: "center" }}>
					<strong>
						{`**This is a sample invoice just for testing**`}
					</strong>
				</small>
			</table>
		</div>
	);
}

export default InvoiceTemplate;
