// convertToVScodeDev.js
'use strict';
//
const convertToVScodeDev = (() => {
    const inputUserValue = document.querySelector("#sampleUserInput");
    const resultTextArea = document.querySelector("#resultTextArea");
    const devItem = {
        name : "vscode-dev",
        url  : "https://vscode.dev",
        path : "/",
        label: "VSCode.dev",
    }
    const githubInfo = {
        user: '',
        project: '',
        hostname: '',
        email: '',
        avatar_url: '',
        name: '',
        repos_url: '',
    };
    const init_githubInfo = () => {
        let keys = Object.keys(githubInfo)
        keys.forEach((key) => githubInfo[key] = '');
    };
    const deleteUserInput = () => {
        inputUserValue.value = "";
    }
    const showTextMessage = (message) => {
        resultTextArea.textContent = message;
    };
    const convert = async () => {
        console.log(inputUserValue.value);
        await init_githubInfo();
        // no input return early.
        if (! inputUserValue.value) {
            resultTextArea.textContent = "githubのレポジトリURLを入力してください";
            return;
        }
        resultTextArea.textContent = "";
        let inputProjectURL = new URL(inputUserValue.value);
        console.log(inputProjectURL);
        console.log(inputProjectURL.origin);
        if (inputProjectURL.origin === 'https://github.com') {
            devItem.path = inputProjectURL.pathname;
            console.log(devItem);
            let success = await getGithubInfo(inputUserValue.value);
            if (success) {
                let keys = Object.keys(githubInfo)
                keys.forEach((key) => console.log(`${key} : ${githubInfo[key]}`));
            }
        } else {
            showTextMessage("githubのレポジトリURLを入力してください");
        }
    };
    const getGithubInfo = async (inputUserValue) => {
        console.log('inputUserValue: ' + inputUserValue);
        let inputUserArray = inputUserValue.split('/');
        console.log(inputUserArray);
        if (inputUserArray.length < 5 || inputUserArray[4].length === 0) {
            showTextMessage("githubのレポジトリURLを入力してください（パスの長さが足りません）");
            return false;
        }
        inputUserArray.map((path, index)=>{
            switch(index) {
                case 2:
                    console.log(path);
                    githubInfo.hostname = path;
                    break;
                case 3:
                    console.log(path);
                    githubInfo.user = path;
                    break;
                case 4:
                    console.log(path);
                    githubInfo.project = path;
                    break;
            }
        });
        let githubaUserURL = 'https://api.github.com/users/' + githubInfo.user;
        resultTextArea.innerHTML = '';
        // GETリクエスト（通信）
        await axios.get(githubaUserURL)
            // thenで成功した場合の処理
            .then((res) => {
                console.dir(res.data);
                githubInfo.email = res.data.email;
                githubInfo.name  = res.data.name;
                githubInfo.repos_url  = res.data.repos_url;
                githubInfo.avatar_url = res.data.avatar_url;
                insertResultTextArea(devItem);
            })
            // catchでエラー時の挙動を定義
            .catch(error => {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                    if (error.response.status === 404) {
                        showTextMessage("該当するユーザーはいません");
                    }
                } else if (error.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    console.log(error.request);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('Error', error.message);
                }
                console.log(error.config);
                return false;
            });
        return true;
    };
    const insertResultTextArea = (devItem) => {
        let vscodeURL = devItem.url + '/' +
                        githubInfo.hostname + '/' +
                        githubInfo.user + '/' +
                        githubInfo.project + '/';
        resultTextArea.innerHTML += `<p class="show-user"> 
            user <img src="${githubInfo.avatar_url}" alt="user image" class="show-user-image"> : 
            ${githubInfo.user}(${githubInfo.name}, ${githubInfo.email})</p>`;
        resultTextArea.innerHTML += `<p class="show-project">project : ${githubInfo.project}</p>`;
        resultTextArea.innerHTML += `<p class="show-vscode-devr">URL : <a href="${vscodeURL}" target="_blank" class="tooltip">
                                    <span class="tooltip-text">${vscodeURL}</span>
                                    ${devItem.label}</a></p>`;
        // add github dev link
        let githubDevURL = 'https://github.dev' + '/' +
                        githubInfo.user + '/' +
                        githubInfo.project + '/';
                        resultTextArea.innerHTML += `<p class="show-vscode-devr">URL : <a href="${githubDevURL}" target="_blank" class="tooltip">
                        <span class="tooltip-text">${githubDevURL}</span>
                        github.dev</a></p>`;
    };
    return {
        deleteUserInput, convert,
    };
})();
//