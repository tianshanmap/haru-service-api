const API_BASE_URL_8080 = window.APP_CONFIG.API_URL_8080;
// Reusable request wrapper
const callRemote = async (remote_url) => {
      try {
        const response = await fetch(remote_url);
        const data = await response.json();
        console.log("data.files=" + JSON.stringify(data));
        return data;
      } catch (error) {
        console.error("Error fetching data:", error);
        return null;
      }
}  

export default function getDirectory(name) {
    return callRemote(API_BASE_URL_8080 + '/folder?name=' + name)
}
export function getRoot() {
    return getDirectory("/")
}
export function getAudioList() {
    return callRemote(API_BASE_URL_8080 + '/video/audio_list')
}
export function getVideoList() {
    return callRemote(API_BASE_URL_8080 + '/video/export_list')
}
export function getVideoUploadPath() {
    return callRemote(API_BASE_URL_8080 + '/upload_target_path')
}

export function copy(from,to) {
    return callRemote(API_BASE_URL_8080 + '/copy?name=' + from + '&parent=' + to);
}
export function move(from,to) {
    return callRemote(API_BASE_URL_8080 + '/move?name=' + from + '&parent=' + to);
}
export function deleteFile(name,target="") {
    if (target == "")
        return callRemote(API_BASE_URL_8080 + '/delete?name=' + name);
    else 
        return callRemote(API_BASE_URL_8080  + '/delete?name=' + name + '&parent=' + target);
}
export function createDirectory(name,target) {
    return callRemote(API_BASE_URL_8080  + '/create?name=' + name + '&parent=' + target);
}
export function convertMtsToMp4(name,target) {
    return callRemote(API_BASE_URL_8080  + '/convert?name=' + name + '&parent=' + target);
}
export function getUploadEndPoint() {
    return API_BASE_URL_8080  + '/upload';
}
export function getViewEndPoint(name) {
    return API_BASE_URL_8080  + '/view?name=' + name;
}
export function getDeleteEndPoint(name,parent) {
    return API_BASE_URL_8080  + '/delete?name=' + name + "&parent=" + parent;
}
export function getMoveEndPoint(name,parent) {
    return API_BASE_URL_8080  + '/move?name=' + name + "&parent=" + parent;
}
export function getCreateEndPoint(name,parent) {
    return API_BASE_URL_8080  + '/create?name=' + name + "&parent=" + parent;
}
export function getAudioGenerateEndPoint() {
    console.log("getAudioGenerateEndPoint,API_BASE_URL_8080=" + API_BASE_URL_8080);
    return API_BASE_URL_8080  + '/audio/generate';
}

export function generateVideo(request) {
    const remote_url = API_BASE_URL_8080 + "/video/generate/v1";
    const invokeRemote = async () => {
        try {
            const response = await fetch(remote_url, {
                method: 'POST', // Explicitly declare POST method
                headers: {
                    'Content-Type': 'application/json', // Instruct the server you are sending JSON data
                },
                body: JSON.stringify(request), // Serialize JavaScript object to JSON string
            });
            if (!response.ok) {
            throw new Error('Network response was not ok');
            }

            const data = await response.json(); // Parse the server response
            return data;
        } catch (error) {
            console.error("Error fetching data:", error);
            return null;
        }
    }  
    return invokeRemote();
}
export function saveNotes(request) {
    const remote_url = API_BASE_URL_8080 + "/texteditor/save";
    const invokeRemote = async () => {
        try {
            const response = await fetch(remote_url, {
                method: 'POST', // Explicitly declare POST method
                headers: {
                    'Content-Type': 'application/json', // Instruct the server you are sending JSON data
                },
                body: JSON.stringify(request), // Serialize JavaScript object to JSON string
            });
            if (!response.ok) {
            throw new Error('Network response was not ok');
            }

            const data = await response.json(); // Parse the server response
            return data;
        } catch (error) {
            console.error("Error fetching data:", error);
            return null;
        }
    }  
    return invokeRemote();
}
export async function getNotes(name) {
    const remote_url = API_BASE_URL_8080 + "/texteditor/load?name=" + name;
    try {
        const response = await fetch(remote_url);
        const data = await response.json();
        return data.content;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}    
