document.querySelector('.formch').addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new FormData(this);

    fetch('/upload-profile-pic', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const newProfileImagePath = data.newProfileImagePath;

            // Update profile image path in localStorage
            let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
            accounts = accounts.map(account => {
                if (account.email === "<%= user.email %>") { // Replace with the user's email
                    account.profileImagePath = newProfileImagePath;
                }
                return account;
            });
            localStorage.setItem('accounts', JSON.stringify(accounts));

            // Update the image on the profile page
            document.querySelector('.imgprofile').src = newProfileImagePath;
            document.getElementById('profile-button').src = newProfileImagePath;
            console.log(newProfileImagePath)

            alert('Profile picture updated successfully!');
            fetchhAccounts();
        } else {
            alert('Failed to upload profile picture.');
        }
    })
    .catch(error => console.error('Error uploading profile picture:', error));
    let localAccount = JSON.parse(localStorage.getItem('accounts')) || [];
    console.log(localAccount);
});

document.querySelector('.log').addEventListener('click', function() {
    const currentProfileImagePath = document.querySelector('.imgprofile').src;
    
    let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    accounts = accounts.map(account => {
        if (account.email === "<%= user.email %>") { // Replace with the user's email
            account.profileImagePath = currentProfileImagePath;
        }
        return account;
    });
    localStorage.setItem('accounts', JSON.stringify(accounts));

    // Now redirect to logout
    window.location.href = '/logout';
});


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
    const emailExists = localAccounts.some(account => account.email === email);

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

    form.submit();
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
                <img class="profile-image" src="${account.profileImagePath || 'assets/images/firefly.jpg'}" alt="${account.email}'s profile image"/>
                <p class="account-info">${account.username || 'Unknown'} (${account.email})</p>
                <button class="account-button" onclick="useAccount('${account.email}', '${account.password}')">Use</button>
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
}

function deleteAccount(email) {
    let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
    accounts = accounts.filter(account => account.email !== email);
    localStorage.setItem('accounts', JSON.stringify(accounts));
    fetchAccounts(); // Refresh the displayed accounts
}

document.getElementById('loginForm').addEventListener('submit', handleFormSubmit);


document.querySelector('.profile-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new FormData(this);

    fetch('/update-profile', {
        method: 'POST',
        body: formData,
    })
    .then(response => {
        if (response.redirected) {
            // If the response is a redirect, handle localStorage update here
            const email = formData.get('email');
            const password = formData.get('password');

            if (password) {
                // Update localStorage with the new password
                let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
                accounts = accounts.map(account => {
                    if (account.email === email) {
                        account.password = password;
                    }
                    return account;
                });
                localStorage.setItem('accounts', JSON.stringify(accounts));
            }
            // Redirect to the profile page
            window.location.href = response.url;
        }
    })
    .catch(error => console.error('Error updating profile:', error));
});
