

function updateDCF(lowGrowth, highGrowth, lowCase, highCase, riskOriginal)
{
console.log("first results");
	let results = dcf.CalcValue(growthInput.value, {
                'discount': riskInput.value / 100, 
                'fcf': fcfInput.value, 
                'riskFree': riskFreeInput.value / 100
            });
	
	let text = `${ (results.series[9].value / fcfInput.value).toFixed(1) }x in 10 years`;


    document.getElementById('growthArea').innerHTML = text;

	//render the 1st pahse

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


	lowResult = dcf.CalcValue(lowGrowth, {
                'discount': riskOriginal, 
                'fcf': fcfInput.value, 
                'riskFree': riskFreeInput.value / 100
            });

    highResult = dcf.CalcValue(highGrowth, {
                'discount': riskOriginal, 
                'fcf': fcfInput.value, 
                'riskFree': riskFreeInput.value / 100
            });

    avgResult = dcf.CalcValue((lowGrowth + highGrowth) / 2, {
                'discount': riskOriginal, 
                'fcf': fcfInput.value, 
                'riskFree': riskFreeInput.value / 100
            });


	//render the bar

new Chartist.Bar('#barChart', {
        labels: ['Current Price', 'Low Case (' + lowCase +')', 'Average', 'High Case (' + highCase + ')'],
        series: [
          [results.value * mktCaptoSP, lowResult.value * mktCaptoSP, avgResult.value * mktCaptoSP, highResult.value * mktCaptoSP]
        ]
      }, {
  
  plugins: [
    Chartist.plugins.ctBarLabels({
      labelInterpolationFnc: function (text) {
        return text.toFixed(1)
      }
    })
  ]
}).on('draw', function(data) {
  if(data.type === 'bar') {
    data.element.attr({
      style: 'stroke-width: 100px'
    });
  }
});




}
