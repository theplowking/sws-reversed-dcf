

function updateDCF(targetPrice, highGrowth, lowCase, highCase, riskOriginal, mktCaptoSP, stock, originalSP)
{

	let results = dcf.CalcValue(growthInput.value, {
                'discount': riskInput.value / 100, 
                'fcf': fcfInput.value, 
                'riskFree': riskFreeInput.value / 100
            });
	



    document.getElementById('growthin10').innerHTML = `${ (results.series[9].value / fcfInput.value).toFixed(1) }x`;

    //document.getElementById('heading').innerHTML = "If " + stock + " grows by " + growthInput.value + "% per year in next 3 years, it should be worth $" + Math.round(results.value * mktCaptoSP,2);

   document.getElementById('heading').innerHTML = "To justify a price of <strong>$" + (results.value * mktCaptoSP).toFixed(2) + "</strong> " + stock + " would need to grow earnings by ";
	//render the 1st pahse
  document.getElementById('price').innerHTML = "$" + (results.value * mktCaptoSP).toFixed(2);


if(document.getElementById('lineChart'))
{
  new Chartist.Line('#lineChart', {
        labels: results.labels,
        series: [
          results.series
        ]
      }, {
      low: 0,
      showArea: true,
      fullWidth: true,
      plugins: [
        Chartist.plugins.tooltip()
      ]
      });
}
	


	// lowResult = dcf.CalcValue(lowGrowth, {
 //                'discount': riskOriginal, 
 //                'fcf': fcfInput.value, 
 //                'riskFree': riskFreeInput.value / 100
 //            });

    highResult = dcf.CalcValue(highGrowth, {
                'discount': riskOriginal, 
                'fcf': fcfInput.value, 
                'riskFree': riskFreeInput.value / 100
            });



 //    avgResult = dcf.CalcValue((lowGrowth + highGrowth) / 2, {
 //                'discount': riskOriginal, 
 //                'fcf': fcfInput.value, 
 //                'riskFree': riskFreeInput.value / 100
 //            });


	//render the bar

new Chartist.Bar('#barChart', {
        labels: ['Your Estimate', 'Current Price', 'Analyst Target'],
        series: [
          [results.value * mktCaptoSP, originalSP, /*lowResult.value * mktCaptoSP, avgResult.value * mktCaptoSP,*/ targetPrice ? targetPrice : highResult.value * mktCaptoSP]
        ]
      }, {
  
  plugins: [
    Chartist.plugins.ctBarLabels({
      labelInterpolationFnc: function (text) {
        return "$" + text.toFixed(1)
      }
    })
  ]
}).on('draw', function(data) {
  if(data.type === 'bar') {
    data.element.attr({
      style: 'stroke-width: 75px'
    });
  }
});




}
