

function updateDCF()
{

	let results = dcf.CalcValue(growthInput.value, {
                'discount': riskInput.value / 100, 
                'fcf': fcfInput.value, 
                'riskFree': riskFreeInput.value / 100
            });

	console.log(results);

	new Chartist.Line('.ct-chart', {
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
