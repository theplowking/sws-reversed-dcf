console.log("DCF is loaded");

(function(exports){

    exports.CalcValue = function (growthRate, inputs)
    {
        

        let discount = inputs.discount;
        let fcf = inputs.fcf;
        let riskFree = inputs.riskFree;

        growthRate = growthRate / 100;
        
        let decayFac = 0.7;
        let years = 10;
        let CalcValue = 0;

        let results = {};
        results.labels = [];
        results.series = [];
        results.growth = [];

        //first stage
        for (i = 1; i <= years; i++) {
          
            let decay = Math.pow(decayFac, i - 1);
            let growth = (riskFree + (growthRate - riskFree) * decay);
            fcf = fcf * (1 + growth);

            CalcValue = CalcValue + (fcf / Math.pow(1 + discount, i));

            results.labels.push('Year ' + i);
            results.series.push({meta: "Growth rate: " + growth, value: fcf});
            //results.growth.push(growth);
        }
        
        //Terminal value
        results.tv = fcf * (1 + riskFree) / (discount - riskFree);
        results.pvtv = results.tv / Math.pow(1 + discount, years);
        
        results.value = CalcValue + results.pvtv;

        //console.log(growthRate, inputs, CalcValue);
        //console.log(results);
        return results;
    };

})(typeof exports === 'undefined'? this['dcf']={}: exports);
