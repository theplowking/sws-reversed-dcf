

function updateDCF(lowGrowth, highGrowth, lowCase, highCase, riskOriginal, mktCaptoSP, stock, originalSP)
{
console.log("first results");
	let results = dcf.CalcValue(growthInput.value, {
                'discount': riskInput.value / 100, 
                'fcf': fcfInput.value, 
                'riskFree': riskFreeInput.value / 100
            });
	
	let text = `Equivilent to <strong>${ (results.series[9].value / fcfInput.value).toFixed(1) }x</strong> in 10 years`;


    document.getElementById('persp').innerHTML = text;

    //document.getElementById('heading').innerHTML = "If " + stock + " grows by " + growthInput.value + "% per year in next 3 years, it should be worth $" + Math.round(results.value * mktCaptoSP,2);

    document.getElementById('heading').innerHTML = "If " + stock + " grows earnings by ";

  document.getElementById('heading0').innerHTML = "it should be worth <strong>$" + (results.value * mktCaptoSP).toFixed(2) + "</strong>";
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
        labels: ['💸 Your Model 💸', 'Current Price', 'Low Case (' + lowCase +')', 'High Case (' + highCase + ')'],
        series: [
          [results.value * mktCaptoSP, originalSP, lowResult.value * mktCaptoSP, /*avgResult.value * mktCaptoSP,*/ highResult.value * mktCaptoSP]
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
      style: 'stroke-width: 75px'
    });
  }
});




}
