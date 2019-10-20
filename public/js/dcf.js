console.log("DCF is loaded");

(function(exports){

    exports.CalcValue = function (growthRate, inputs, loss_making)
    {
            
        let discount = inputs.discount;

        let fcf = inputs.fcf;

        rev = inputs.revenue;

        let margin = null;
        
        let riskFree = inputs.riskFree;

        growthRate = growthRate / 100;
        
        let decayFac = 0.7;
        let years = 10;
        let CalcValue = 0;

        let results = {};
        results.labels = [];
        series0 = [];
        series1 = [];
        results.growth = [];

        //first stage
        for (i = 1; i <= years; i++) {
            
            let decay = i <= inputs.linear_years ? 1 : Math.pow(decayFac, i - 1);
            let growth = (riskFree + (growthRate - riskFree) * decay);

            if(!loss_making){
                fcf = fcf * (1 + growth);
            }
            else{
                margin = (inputs.end_margin + (inputs.start_margin - inputs.end_margin) * ((years - i)/ years));
                //let revenue = revenue * (1 + growth);
                rev = rev * (1 + growth);
                fcf = rev * margin;
                series1.push(rev);
            }

            CalcValue = CalcValue + (fcf / Math.pow(1 + discount, i));

            results.labels.push(2019 + i);
            //results.series[0].push({meta: "Growth rate: " + growth, value: fcf, revenue: rev, margin: margin});
            series0.push(fcf);
            
            //results.growth.push(growth);
        }
        
        results.series = [ series0, series1 ];
        //Terminal value
        results.tv = fcf * (1 + riskFree) / (discount - riskFree);
        results.pvtv = results.tv / Math.pow(1 + discount, years);
        
        results.value = CalcValue + results.pvtv;

        // console.log(growthRate, inputs, CalcValue);
        //console.log(results);
        return results;
    };

})(typeof exports === 'undefined'? this['dcf']={}: exports);
