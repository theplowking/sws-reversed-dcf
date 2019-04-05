var rp = require('request-promise');
var errors = require('request-promise/errors');
var argv = require('minimist')(process.argv.slice(2));

run('ASX:TLS');

function run(stock)
{
    // console.log(CalcValue(
    //         -5,
    //         {
    //             'discount': 0.1, 
    //             'fcf': 25451,
    //             'riskFree': 0.01227
    //         }));
    
    reverseDCF(stock);
}

function goalSeek(assumptions, goal)
{

    let oldVal = null;
    let newVal = null;
    let step = 100;

    //define the bounds
    for (g = -1000; g <= 10000; g=g+step) {
        oldVal = newVal;
        newVal = CalcValue(g, assumptions);
        //console.log("growth:" + g, "oldVal:" + oldVal, "newVal:" + newVal, "goal:" + goal);
         if (oldVal < goal && newVal > goal)
             break;
    }

    let oldGrowth = g - step;
    //console.log("growth is between "+(g-step)+" and "+g+" , now begin interation");
    //iterate between the bounds
    for (x = 0; x <= 100; x++) {

        //linear interpolate g
        let interpolateGrowth = oldGrowth + ( (goal - oldVal) / (newVal - oldVal) * (g - oldGrowth));

        oldVal = newVal;
        newVal = CalcValue(interpolateGrowth, assumptions);

        //console.log("trying growth:" + interpolateGrowth, "oldVal:" + oldVal, "newVal:" + newVal, "tol:" + (Math.abs(newVal - goal) / goal));
        
        if ((Math.abs(newVal - goal) / goal) < 0.001)
        {
            return interpolateGrowth;
        }

        if( newVal < goal)
        {
            //target is under
            //console.log('under');
            oldGrowth = interpolateGrowth;
        }
        else
        {   
            //console.log('over');
            g = interpolateGrowth;
        }

        

    }

    
}


function options(ticker) {
  
    return {
        uri: 'https://simplywall.st/api/company/'+ticker+'?include=info,score,score.snowflake,analysis.extended.raw_data&version=2.0',
        headers: {
            'Accept':       'application/vnd.simplywallst.v2'
        },
        json: true, // Automatically parses the JSON string in the response
        //resolveWithFullResponse: true
        transform2xxOnly: true
    };
};

function reverseDCF(stock) {
    rp(options(stock))
    .then(function (response) {

        let inputs = {
            name: response.data.name,
            goal: response.data.analysis.data.extended.data.raw_data.data.market_cap.reported / response.data.analysis.data.extended.data.raw_data.data.currency_info.reporting_unit,
            assumptions: {
                'discount': response.data.analysis.data.extended.data.analysis.value.intrinsic_value.cost_of_equity, 
                'fcf': Object.values(response.data.analysis.data.extended.data.analysis.value.intrinsic_value.two_stage_fcf.adjust_free_cash_flow_time_series).pop(), 
                'riskFree': response.data.analysis.data.extended.data.analysis.value.intrinsic_value.risk_free_rate
            }
        };

        //console.log(inputs);

        return goalSeek(inputs.assumptions, inputs.goal);


        // console.log(response.data.name);
        // console.log(response.data.analysis.data.share_price);
        // console.log(Object.values(response.data.analysis.data.extended.data.analysis.value.intrinsic_value.two_stage_fcf.adjust_free_cash_flow_time_series).pop());
        // console.log(response.data.analysis.data.extended.data.analysis.health.levered_free_cash_flow);
        // console.log(response.data.analysis.data.extended.data.analysis.value.intrinsic_value.risk_free_rate);
        
    })
    .catch(function (err) {
         console.log(err);
    });
}



function CalcValue(growthRate, inputs)
{
    

    let discount = inputs.discount;
    let fcf = inputs.fcf;
    let riskFree = inputs.riskFree;

    growthRate = growthRate / 100;
    
    let decayFac = 0.7;
    let years = 10;
    let CalcValue = 0;

    //first stage
    for (i = 1; i <= years; i++) {
      
        let decay = Math.pow(decayFac, i - 1);
        let growth = (riskFree + (growthRate - riskFree) * decay);
        fcf = fcf * (1 + growth);

        CalcValue = CalcValue + (fcf / Math.pow(1 + discount, i));

    }
    
    //Terminal value
    tv = fcf * (1 + riskFree) / (discount - riskFree);
    pvtv = tv / Math.pow(1 + discount, years);
    
    
    CalcValue = CalcValue + pvtv;

    //console.log(growthRate, inputs, CalcValue);

    return CalcValue;
}



var appRouter = function (app) {


  app.get("/reverse_dcf", function (req, res) {

    console.log('requested ');

    var stock = req.query.stock;

    console.log(stock);

    rp(options(stock))
    .then(function (response) {

        let inputs = {
            name: response.data.name,
            goal: response.data.analysis.data.extended.data.raw_data.data.market_cap.reported / response.data.analysis.data.extended.data.raw_data.data.currency_info.reporting_unit,
            assumptions: {
                'discount': response.data.analysis.data.extended.data.analysis.value.intrinsic_value.cost_of_equity, 
                'fcf': Object.values(response.data.analysis.data.extended.data.analysis.value.intrinsic_value.two_stage_fcf.adjust_free_cash_flow_time_series).pop(), 
                'riskFree': response.data.analysis.data.extended.data.analysis.value.intrinsic_value.risk_free_rate
            },
            share_price: response.data.analysis.data.share_price,
            past_growth: 100 * response.data.analysis.data.extended.data.analysis.past.net_income_growth_5y,
            future_growth: 100 * response.data.analysis.data.extended.data.analysis.future.net_income_growth_annual
        };

        inputs.result = goalSeek(inputs.assumptions, inputs.goal);

        //res.status(200).send("Welcome to Mr Correlation");
        res.status(200).send( inputs );

    })
    .catch(function (err) {
         res.status(500).send( "Unable to find "+stock );
    });

    
    
  });


}



module.exports = appRouter;