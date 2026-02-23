const API_KEY = "ENTER_YOUR_KEY";

let stockChart;

function loadStock(symbol) {
    document.getElementById("stockInput").value = symbol;
    searchStock();
    highlightActive(symbol);
}

function highlightActive(symbol) {
    const items = document.querySelectorAll("#stockList li");
    items.forEach(item => {
        item.classList.remove("active");
        if (item.innerText === symbol) {
            item.classList.add("active");
        }
    });
}

async function searchStock() {

    const symbol = document.getElementById("stockInput").value.toUpperCase().trim();
    if (!symbol) return alert("Enter a stock symbol");

    document.getElementById("stockTitle").innerText = symbol + " Performance";

    try {

        const response = await fetch(
            `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`
        );

        const data = await response.json();

        if (!data["Time Series (Daily)"]) {
            alert("API limit reached or invalid symbol.");
            return;
        }

        const timeSeries = data["Time Series (Daily)"];
        const dates = Object.keys(timeSeries).slice(0, 30).reverse();
        const prices = dates.map(d => parseFloat(timeSeries[d]["4. close"]));
        const volumes = dates.map(d => parseFloat(timeSeries[d]["5. volume"]));

        const latest = timeSeries[dates[dates.length - 1]];
        const previous = timeSeries[dates[dates.length - 2]];

        const currentPrice = parseFloat(latest["4. close"]);
        const prevClose = parseFloat(previous["4. close"]);
        const changeDollar = (currentPrice - prevClose).toFixed(2);
        const changePercent = ((currentPrice - prevClose) / prevClose * 100).toFixed(2);

        const return5 = ((currentPrice - prices[prices.length - 6]) / prices[prices.length - 6] * 100).toFixed(2);
        const return30 = ((currentPrice - prices[0]) / prices[0] * 100).toFixed(2);
        const avgVolume = (volumes.reduce((a,b)=>a+b,0) / volumes.length).toFixed(0);

        document.getElementById("price").innerText = "$" + currentPrice;
        document.getElementById("open").innerText = "$" + latest["1. open"];
        document.getElementById("high").innerText = "$" + latest["2. high"];
        document.getElementById("low").innerText = "$" + latest["3. low"];
        document.getElementById("prevClose").innerText = "$" + prevClose;

        document.getElementById("changeDollar").innerText = "$" + changeDollar;
        document.getElementById("changePercent").innerText = changePercent + "%";
        document.getElementById("return5").innerText = return5 + "%";
        document.getElementById("return30").innerText = return30 + "%";

        document.getElementById("volume").innerText = volumes[volumes.length - 1];
        document.getElementById("avgVolume").innerText = avgVolume;

        document.getElementById("changePercent").className =
            changePercent >= 0 ? "green" : "red";

        if (stockChart) stockChart.destroy();

        const ctx = document.getElementById("stockChart").getContext("2d");

        stockChart = new Chart(ctx, {
            type: "line",
            data: {
                labels: dates,
                datasets: [{
                    data: prices,
                    borderColor: "#00f5ff",
                    backgroundColor: "rgba(0,245,255,0.1)",
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                plugins: { legend: { display: false } }
            }
        });

    } catch (error) {
        alert("Error fetching data.");
        console.error(error);
    }

}


//9HQCCMDW4318V1R1
