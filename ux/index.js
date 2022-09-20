import { transform } from "https://cdn.jsdelivr.net/gh/episphere/quest@latest/replace2.js"


function storeResponse(obj) {
    return new Promise((resolve) => {
        console.log("store response ", obj)
        getResponse().then(res => {
            let collectedData = res.data
            for (const prop in obj) {
                localforage.getItem("iCare")
                let p1 = prop.split(".")[1]
                collectedData[p1] = obj[prop]
                console.log(collectedData)
                localforage.setItem("iCare", collectedData)
            }

            if (collectedData.COMPLETED) {
                runICARE(collectedData)
            }

            resolve()
        })
    })
}

async function getResponse() {
    let response = {
        "data": await localforage.getItem("iCare") ?? {},
        "code": 200
    }
    return response;
}





function reformatData(orig) {
    console.log(orig)


    console.log(" --------------   IN REFORMAT DATA -------------")
    if (orig.SEXATBIRTH=="0" || orig.RACEETH!=5){
        return false        
    }
    let obj = {}
    obj.mapping = {};
    obj.mapping.payload ={}

    obj.mapping.payload.age=parseInt(orig.AGE.AGE_INP)
    obj.mapping.payload.gender= (orig.SEXATBIRTH=="1")?"Female":"Male"
    obj.mapping.payload.ethnicity = (orig.RACEETH) ? {
        "0": "American Indian or Alaska Native", "1": "Asian", "2": "Black or African American", "3": "Hispanic",
        "4": "Native Hawaiian or Other Pacific Islander", "5": "Non-Hispanic White", "6": "Other"
    }[orig.RACEETH] : ""
    obj.mapping.payload.bmi_lbs = (orig.WEIGHT?.WEIGHT_INP)?orig.WEIGHT?.WEIGHT_INP:"Unknown";
    obj.mapping.payload.height_feet = (orig.HEIGHT?.HEIGHT_FT)?orig.HEIGHT.HEIGHT_FT:"Unknown";
    obj.mapping.payload.height_inches = (orig.HEIGHT?.HEIGHT_IN)?orig.HEIGHT.HEIGHT_IN:"Unknown";
    obj.mapping.payload.hormone_prescription = (orig.HORMONETREATMENT) ?? "Unknown";
    obj.mapping.payload.is_hormonal_currently_used = (orig.HORMONETREATMENTCURRENT) ?? null;
    obj.mapping.payload.hormone_prescription_type = (orig.HORMONETREATMENTTYPE)?{"1":"Estrogen prescription hormone only","2":"Combined estrogen plus progestin prescription hormones","99":"Unknown"}[orig.HORMONETREATMENTTYPE]:""
    obj.mapping.payload.is_hormonal_med_used = (orig.HORMONALCONTRACEPTIVE) ?? null;
    obj.mapping.payload.is_hormonal_med_currently_used = (orig.HORMONALCONTRACEPTIVECURRENT) ?? null;
    obj.mapping.payload.alcohol_beverage = orig.ALCOHOLUSE ?? ""
    obj.mapping.payload.alcohol_types_drank_wine = (orig.ALCOHOLUSE?.includes("1"))?1:0;
    obj.mapping.payload.alcohol_types_drank_cider = (orig.ALCOHOLUSE?.includes("2"))?1:0;
    obj.mapping.payload.alcohol_types_drank_beer = (orig.ALCOHOLUSE?.includes("3"))?1:0;
    obj.mapping.payload.alcohol_types_drank_pop = (orig.ALCOHOLUSE?.includes("4"))?1:0;
    obj.mapping.payload.alcohol_types_drank_liquor = (orig.ALCOHOLUSE?.includes("5"))?1:0;
    obj.mapping.payload.alcohol_types_drank_unknown = (orig.ALCOHOLUSE?.includes("99"))?1:0;
    obj.mapping.payload.alcohol_beverage_frequency_wine = (orig?.WINEFREQ)?orig.WINEFREQ:"";
    obj.mapping.payload.alcohol_beverage_frequency_cider = (orig?.BLCFREQ)?orig.BLCFREQ:"";
    obj.mapping.payload.alcohol_beverage_frequency_beer = (orig?.BEERFREQ)?orig.BEERFREQ:"";
    obj.mapping.payload.alcohol_beverage_frequency_pop = (orig?.POPFREQ)?orig.POPFREQ:"";
    obj.mapping.payload.alcohol_beverage_frequency_liquor = (orig?.SHOTFREQ)?orig.SHOTFREQ:"";
    obj.mapping.payload.alcohol_beverage_quantity_wine = (orig?.WINESERVING)?orig.WINESERVING:"";
    obj.mapping.payload.alcohol_beverage_quantity_cider = (orig?.BLCSERVING)?orig.BLCSERVING:"";
    obj.mapping.payload.alcohol_beverage_quantity_beer = (orig?.BEERSERVING)?orig.BEERSERVING:"";
    obj.mapping.payload.alcohol_beverage_quantity_pop = (orig?.POPSERVING)?orig.POPSERVING:"";
    obj.mapping.payload.alcohol_beverage_quantity_liquor = (orig?.SHOTERVING)?orig.SHOTSERVING:"";
    obj.mapping.payload.has_smoked = (orig?.SMOKING)?orig.SHOTSERVING:"";
    obj.mapping.payload.age_at_first_menstrual_period = (orig?.MENARCHE)?orig.MENARCHE:"";
    obj.mapping.payload.has_period_stopped = (orig?.NOPERIOD)?orig.NOPERIOD:"";
    obj.mapping.payload.age_at_last_menstrual_period = (orig?.LASTPERIODAGE)?orig.LASTPERIODAGE:"";
    return obj
}

function runICARE(data) {
    document.getElementById("questDiv").classList.add('d-none')
    //document.getElementById("restart").classList.add('d-none')
    //
    console.log("run icare...")
    let reformattedData = reformatData(data)
    if (!reformattedData){
        document.getElementById("iCareDiv").innerHTML = "iCare Not Run"
        return
    }
    document.getElementById("iCareDiv").innerHTML = `<code>${JSON.stringify(reformattedData)}</code>` 
    // cleanup
    //Object.keys(collectedData).forEach(key => delete collectedData[key])
}


document.getElementById("restart").addEventListener("click", () => {
    localforage.clear()
    location.reload()
})

window.addEventListener("load", async () => {
    let collectedData = await localforage.getItem("iCare")
    if (collectedData?.COMPLETED) {
        runICARE(collectedData)
    } else {
        transform.render(
            {
                url: "iCare.txt",
                activate: true,
                store: storeResponse,
                retrieve: getResponse
            },
            "questDiv", // div id
            {} // previous results
        )
    }

});


