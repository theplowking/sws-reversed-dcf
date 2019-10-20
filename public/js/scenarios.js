

function updateDCF(lowGrowth, highGrowth, lowCase, highCase, riskOriginal, mktCaptoSP, stock, originalSP, loss_making)
{

  if(loss_making){
     results = dcf.CalcValue(growthInput.value, {
                    'discount': riskInput.value / 100, 
                    'revenue': revenueInput.value,
                    'start_margin': startMarginInput.value / 100, 
                    'end_margin': marginInput.value / 100,  
                    'riskFree': riskFreeInput.value / 100,
                    'linear_years': document.getElementById('linearYearsInput').value
                }, true);

document.getElementById('growthin10').innerHTML = results.series[1][9];

  }
  else{
     results = dcf.CalcValue(growthInput.value, {
                'discount': riskInput.value / 100, 
                'fcf': fcfInput.value, 
                'riskFree': riskFreeInput.value / 100,
                'linear_years': document.getElementById('linearYearsInput').value
            }, false);
  }
	
   document.getElementById('heading').innerHTML = "Based on the assumptions to justify a price of <strong>$" + (results.value * mktCaptoSP).toFixed(2) + "</strong> " + stock + " would need to grow earnings by ";
	//render the 1st pahse
  document.getElementById('price').innerHTML = "$" + (results.value * mktCaptoSP).toFixed(2);


if(document.getElementById('lineChart'))
{
  new Chartist.Line('#lineChart', {
        labels: results.labels,
        series: results.series
      }, {
      low: 0,
      showArea: true,
      fullWidth: true,
      plugins: [
        Chartist.plugins.tooltip()
      ]
      });
}
	
	//render the bar

new Chartist.Bar('#barChart', {
        labels: ['Your Estimate', 'Current Price', 'Analyst Target Low', 'Analyst Target High'],
        series: [
          [results.value * mktCaptoSP, originalSP, lowCase, highCase]
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
