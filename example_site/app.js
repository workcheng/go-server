const output = document.querySelector("#output");
const button = document.querySelector("#load-data");

button.addEventListener("click", async () => {
  output.textContent = "Loading...";
  const response = await fetch("data.json");
  const data = await response.json();
  output.textContent = JSON.stringify(data, null, 2);
});
