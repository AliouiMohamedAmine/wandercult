async function fetchhAccounts() {
    try {
        const response = await fetch('/accounts');
        const accounts = await response.json();
        return accounts; // Return the accounts
    } catch (error) {
        console.error('Error fetching accounts:', error);
        return []; // Return an empty array in case of an error
    }
}

async function updateLocalStorageAccounts() {
    const accountss = await fetchhAccounts(); // Fetch all accounts from the server

    let localAccounts = JSON.parse(localStorage.getItem('accounts')) || [];

    // Update each account in localStorage with the new values from accountss
    localAccounts = localAccounts.map(localAccount => {
        const serverAccount = accountss.find(account => account.email === localAccount.email);
        if (serverAccount) {
            return {
                ...localAccount,
                username: serverAccount.username,
                profileImagePath: serverAccount.profileImagePath
            };
        }
        return localAccount;
    });

    // Save the updated accounts back to localStorage
    localStorage.setItem('accounts', JSON.stringify(localAccounts));
    let localAccount = JSON.parse(localStorage.getItem('accounts')) || [];
    console.log(localAccount);
}

updateLocalStorageAccounts();

async function main() {
    fetchAccounts(); // Load accounts from localStorage and display them
    let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    console.log(accounts);

    let acc = await fetchhAccounts();
    console.log(acc);
}

main(); // Call the async function


function getAccountInfo(accounts, email) {
    const account = accounts.find(account => account.email === email);
    if (account) {
        return {
            username: account.username || null,
            profileImagePath: account.profileImagePath || null
        };
    }
    return {
        username: null,
        profileImagePath: null
    };
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = document.getElementById('loginForm');
    const email = form.elements['email'].value;
    const password = form.elements['password'].value;

    const accounts = await fetchhAccounts();
    const { username, profileImagePath } = getAccountInfo(accounts, email);
    
    let localAccounts = JSON.parse(localStorage.getItem('accounts')) || [];
    const exists = accounts.some(account => account.email === email);
    const emailExists = localAccounts.some(account => account.email === email);
    if (exists){
    if (!emailExists) {
        if (confirm("Do you want to save your account for easier access next time?")) {
            const account = { email, password, profileImagePath, username };
            localAccounts.push(account);
            localStorage.setItem('accounts', JSON.stringify(localAccounts));
        }
    } else {
        // Update the account with the new profile image path
        localAccounts = localAccounts.map(account => {
            if (account.email === email) {
                account.profileImagePath = profileImagePath; // Update profile image path
                account.username = username; // Update username if needed
            }
            return account;
        });
        localStorage.setItem('accounts', JSON.stringify(localAccounts));
    }
}else{
    alert("this email doen't exists");
}

    form.submit();
    console.log(accounts)
}

async function fetchAccounts() {
    let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    displayAccounts(accounts); // Display the accounts
}

function displayAccounts(accounts) {
    const accountsDiv = document.getElementById('accounts');
    accountsDiv.innerHTML = ''; // Clear previous accounts

    accounts.forEach((account) => {
        const accountCard = document.createElement('div');
        accountCard.innerHTML = `
<div class="account-card">
    <div class="profile-section">
        <img class="profile-image" src="${account.profileImagePath || 'assets/images/firefly.jpg'}" alt="${account.email}'s profile image"/>
        <div class="account-info">
            <p class="usernamee">${account.username || 'Unknown'}</p>
            <p class="emaill">${account.email}</p>
        </div>
    </div>
    <button class="account-button" id="useButton" onclick="useAccount('${account.email}', '${account.password}')">Use</button>
    <button class="delete-button account-button" onclick="deleteAccount('${account.email}')">Delete</button>
</div>

        `;
        accountsDiv.appendChild(accountCard);
    });
}

function useAccount(email, password) {
    const emailInput = document.querySelector('input[name="email"]');
    const passwordInput = document.querySelector('input[name="password"]');
    emailInput.value = email;
    passwordInput.value = password;
    document.getElementById('loginForm').submit();
}

function deleteAccount(email) {
    let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    accounts = accounts.filter(account => account.email !== email);
    localStorage.setItem('accounts', JSON.stringify(accounts));
    fetchAccounts(); // Refresh the displayed accounts
}

document.getElementById('loginForm').addEventListener('submit', handleFormSubmit);

