var rp = require('request-promise');
var errors = require('request-promise/errors');
var argv = require('minimist')(process.argv.slice(2));
var dcf = require('./public/js/dcf.js');

run('ASX:TLS');

function run(stock)
{
    // console.log(dcf.CalcValue(
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
        results = dcf.CalcValue(g, assumptions);
        newVal = results.value;
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
        results = dcf.CalcValue(interpolateGrowth, assumptions);
        results.growth = interpolateGrowth;
        newVal = results.value;

        //console.log("trying growth:" + interpolateGrowth, "oldVal:" + oldVal, "newVal:" + newVal, "tol:" + (Math.abs(newVal - goal) / goal));
        
        if ((Math.abs(newVal - goal) / goal) < 0.001)
        {
            return results;
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
        uri: 'https://api.simplywall.st/api/company/'+ticker+'?include=info,score,score.snowflake,analysis.extended.raw_data&version=2.0',
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
//console.log(response);

        let inputs = {
            name: response.data.name,
            goal: response.data.analysis.data.extended.data.raw_data.data.market_cap.reported / response.data.analysis.data.extended.data.raw_data.data.currency_info.reporting_unit,
            assumptions: {
                'discount': response.data.analysis.data.extended.data.analysis.value.intrinsic_value.cost_of_equity, 
                'fcf': Object.values(response.data.analysis.data.extended.data.analysis.value.intrinsic_value.two_stage_fcf.annualized_adjust_free_cash_flow_time_series).pop(), 
                'riskFree': response.data.analysis.data.extended.data.analysis.value.intrinsic_value.risk_free_rate
            }
        };

        console.log(inputs);

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

var fakeResults = '{"name":"Telstra","goal":43373.305729,"assumptions":{"discount":0.0708,"fcf":1893.6410100000003,"riskFree":0.02312},"share_price":3.65,"past_growth":-9.0955,"past_fcf_growth":-16.51374992894722,"future_growth":2.9985999999999997,"analyst_count":9,"revenue":25259,"price_target":10,"loss_making":false,"ind_growth":0.2,"ind_name":"Hello","result":{"labels":["Year 1","Year 2","Year 3","Year 4","Year 5","Year 6","Year 7","Year 8","Year 9","Year 10"],"series":[{"meta":"Growth rate: 0.045487131159813315","value":1979.7773069914715},{"meta":"Growth rate: 0.03877699181186932","value":2056.547115414004},{"meta":"Growth rate: 0.03407989426830853","value":2126.634023665108},{"meta":"Growth rate: 0.030791925987815966","value":2192.1171811249756},{"meta":"Growth rate: 0.028490348191471178","value":2254.5713628917324},{"meta":"Growth rate: 0.026879243734029824","value":2315.1725360706628},{"meta":"Growth rate: 0.025751470613820878","value":2374.7916335992118},{"meta":"Growth rate: 0.024962029429674615","value":2434.0712522464605},{"meta":"Growth rate: 0.02440942060077223","value":2493.485521214793},{"meta":"Growth rate: 0.024022594420540562","value":2553.385512584426}],"growth":4.548713115981331,"tv":54790.68342356078,"pvtv":27645.41364281917,"value":43339.53086238893}}';


// function CalcValueX(growthRate, inputs)
// {
    

//     let discount = inputs.discount;
//     let fcf = inputs.fcf;
//     let riskFree = inputs.riskFree;

//     growthRate = growthRate / 100;
    
//     let decayFac = 0.7;
//     let years = 10;
//     let dcf.CalcValue = 0;

//     let results = {};
//     results.labels = [];
//     results.series = [];
//     results.growth = [];

//     //first stage
//     for (i = 1; i <= years; i++) {
      
//         let decay = Math.pow(decayFac, i - 1);
//         let growth = (riskFree + (growthRate - riskFree) * decay);
//         fcf = fcf * (1 + growth);

//         dcf.CalcValue = dcf.CalcValue + (fcf / Math.pow(1 + discount, i));

//         results.labels.push('Year ' + i);
//         results.series.push({meta: "Growth rate: " + growth, value: fcf});
//         //results.growth.push(growth);
//     }
    
//     //Terminal value
//     results.tv = fcf * (1 + riskFree) / (discount - riskFree);
//     results.pvtv = results.tv / Math.pow(1 + discount, years);
    
//     results.value = dcf.CalcValue + results.pvtv;

//     //console.log(growthRate, inputs, dcf.CalcValue);
//     //console.log(results);
//     return results;
// }



var appRouter = function (app) {


  app.get("/reverse_dcf", function (req, res) {
    //res.status(200).send( fakeResults );
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
                'fcf': Object.values(response.data.analysis.data.extended.data.analysis.value.intrinsic_value.two_stage_fcf.annualized_adjust_free_cash_flow_time_series).pop(), 
                'riskFree': response.data.analysis.data.extended.data.analysis.value.intrinsic_value.risk_free_rate
            },
            share_price: response.data.analysis.data.share_price,
            past_growth: 100 * response.data.analysis.data.extended.data.analysis.past.net_income_growth_5y,
            past_fcf_growth: 100 * response.data.analysis.data.extended.data.analysis.value.intrinsic_value.two_stage_fcf.growth_cagr_5y,
            future_growth: 100 * response.data.analysis.data.extended.data.analysis.future.net_income_growth_annual,
            analyst_count: response.data.analysis.data.extended.data.analysis.misc.analyst_count,
            revenue: response.data.analysis.data.extended.data.analysis.past.revenue,
            price_target: response.data.analysis.data.extended.data.analysis.value.price_target,
            loss_making: false,
            ind_growth: response.data.analysis.data.extended.data.statements.past.VsMarketGrowthStatement.data.eps_growth_industry,
            ind_name: response.data.analysis.data.extended.data.statements.past.VsMarketGrowthStatement.data.industry_name
        };

        if(inputs.assumptions.fcf == null || inputs.assumptions.fcf < 0)
        {
            inputs.assumptions.fcf = inputs.revenue * 0.1;
            inputs.loss_making = true;
        }

        inputs.result = goalSeek(inputs.assumptions, inputs.goal);

        //res.status(200).send("Welcome to Mr Correlation");
        res.status(200).send( inputs );

    })
    .catch(function (err) {
         console.log(err);
         //res.status(500).send( "Unable to find "+stock );
    });

    
    
  });


}



module.exports = appRouter;