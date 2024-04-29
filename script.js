document.addEventListener('DOMContentLoaded', function () {
  const urlsContainer = document.getElementById('urls-container');
  const addUrlForm = document.getElementById('add-url-form');
  const newUrlInput = document.getElementById('new-url-input');
  const rpcList = document.getElementById('rpc-list');

  // List of RPC URLs fetched from the database (dummy data for example)
  let rpcUrls = [
      "https://eth1.lava.build/lava-referer-4e189298-d2e6-4a66-8d19-923b97c19b45/",
      "https://rpc2.example.com",
      "https://rpc3.example.com"
  ];

  // Data template
  const dataTemplate = '{{"method":"eth_getBalance","params":["0x8D97689C9818892B700e27F316cc3E41e17fBeb9", "latest"],"id":{},"jsonrpc":"2.0"}}';

  // Object to store previous balances for comparison
  const previousBalances = {};

  // Function to fetch data from URL
  function fetchData(url) {
      return fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: dataTemplate
      })
          .then(response => {
              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
              return response.json();
          })
          .then(data => {
              return data.result;
          })
          .catch(error => {
              console.error('Error fetching data:', error);
              return 'Error';
          });
  }

  // Function to update UI with URL and balance
  async function updateUI(url) {
      const balance = await fetchData(url);
      const item = document.createElement('div');
      item.classList.add('url-item');
      const paragraph = document.createElement('p');
      let message;
      if (balance !== 'Error') {
          message = `URL: ${url} - Balance in ETH: ${balance / 1e18}`;
          // Check if balance has changed since last update
          if (previousBalances[url] !== balance) {
              console.log(`Balance updated for ${url}. New balance: ${balance}`);
              previousBalances[url] = balance; // Update previous balance
          }
      } else {
          message = `URL: ${url} - Error fetching data`;
          paragraph.classList.add('error');
      }
      paragraph.textContent = message;
      item.appendChild(paragraph);
      urlsContainer.appendChild(item);
  }

  // Function to update UI for all URLs
  async function updateAllURLs() {
      urlsContainer.innerHTML = ''; // Clear previous data
      for (const url of rpcUrls) {
          await updateUI(url);
      }
  }

  // Initial update
  updateAllURLs();

  // Periodically update the UI
  setInterval(updateAllURLs, 5000); // 5 seconds interval

  // Function to update the list of RPC URLs
  function updateRpcList() {
      rpcList.innerHTML = ''; // Clear previous list
      rpcUrls.forEach(url => {
          const li = document.createElement('li');
          li.textContent = url;
          rpcList.appendChild(li);
      });
  }

  // Initial update of RPC list
  updateRpcList();

  // Handle form submission to add new URL
  addUrlForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const newUrl = newUrlInput.value.trim();
      if (newUrl) {
          rpcUrls.push(newUrl);
          updateRpcList(); // Update the RPC list
          updateUI(newUrl); // Update UI immediately with the new URL
          newUrlInput.value = ''; // Clear input field
      }
  });
});
