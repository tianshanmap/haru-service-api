const API_BASE_URL_9080 = window.APP_CONFIG.API_URL_9080;
const API_BASE_URL_9081 = window.APP_CONFIG.API_URL_9081;
const API_BASE_URL_9082 = window.APP_CONFIG.API_URL_9082;
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

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

const api = {
    getDirectory: (name) => callRemote(API_BASE_URL_9080 + '/folder?name=' + name),
    getRoot: () => callRemote(API_BASE_URL_9080 + '/folder?name=/'),
    getFilelist: (name,ext) => callRemote(API_BASE_URL_9080 + '/filelist?name=' + name + '&ext=' + ext),
    copy: (from,to) => callRemote(API_BASE_URL_9080 + '/copy?name=' + from + '&parent=' + to),
    move: (from,to) => callRemote(API_BASE_URL_9080 + '/move?name=' + from + '&parent=' + to),
    deleteFile: (name,target="") => {
        if (target == "")
            return callRemote(API_BASE_URL_9080 + '/delete?name=' + name);
        else 
            return callRemote(API_BASE_URL_9080  + '/delete?name=' + name + '&parent=' + target);
   },
   createDirectory: (name,target) => callRemote(API_BASE_URL_9080  + '/create?name=' + name + '&parent=' + target),
   convertMtsToMp4: (name,target) => callRemote(API_BASE_URL_9080  + '/convert?name=' + name + '&parent=' + target),
   getViewEndPoint: (name) => API_BASE_URL_9080  + '/view?name=' + name,
   getUploadEndPoint: () => API_BASE_URL_9080  + '/upload',
   getDeleteEndPoint: (name,parent) => API_BASE_URL_9080  + '/delete?name=' + name + "&parent=" + parent,
   getMoveEndPoint: (name,target) => API_BASE_URL_9080  + '/move?name=' + name + "&parent=" + parent,
   getCreateEndPoint: (name,target) => API_BASE_URL_9080  + '/create?name=' + name + "&parent=" + parent,
   getAudioGenerateEndPoint: () => API_BASE_URL_9080  + '/audio/generate',
   generateVideo: (request) => {
        const remote_url = API_BASE_URL_9080 + "/video/generate/v1";
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
   },
   saveNotes: (request) => {
    const remote_url = API_BASE_URL_9080 + "/texteditor/save";
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
   },
   getNotes: async (name) => {
    const remote_url = API_BASE_URL_9080 + "/texteditor/load?name=" + name;
    try {
        const response = await fetch(remote_url);
        const data = await response.json();
        return data.content;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
   },
   uploadFileInChunks: async (file,targetPath,setProgress) => {
    console.log("uploadFileInChunks-started");
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    console.log("uploadFileInChunks-totalChunks=" + totalChunks);
    const fileId = `${Date.now()}-${file.name}`;
    console.log("uploadFileInChunks-fileId=" + fileId);

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      console.log("uploadFileInChunks-start=" + start);
      console.log("uploadFileInChunks-end=" + end);
      
      // Slice file using Blob.slice()
      const chunk = file.slice(start, end);
      const formData = new FormData();
      formData.append('target', targetPath);
      formData.append('filename', fileId);
      formData.append('chunkIndex', chunkIndex.toString());
      formData.append('totalChunks', totalChunks.toString());
      formData.append('fileChunk', chunk);

      console.log("uploadFileInChunks-url==" + API_BASE_URL_9081 + '/filesystem/upload_chunk');
      await fetch(API_BASE_URL_9081 + '/filesystem/upload_chunk', {
        method: 'POST',
        body: formData,
      });

      setProgress(Math.round(((chunkIndex + 1) / totalChunks) * 100));
    }
    console.log("uploadFileInChunks,fileId=" + fileId);    
    return fileId;
   },
   getDownloadEndPoint: (name) => API_BASE_URL_9081 + '/filesystem/download-chunk?name=' + name,
   unzip: (fileId,target) => callRemote(API_BASE_URL_9081 + "/filesystem/unzip?filename=" + fileId + "&target=" + target),
   download_chunk: async (filename,onProgress) => {
        const createDownload = (blob,download_filename) => {
            const downloadUrl = URL.createObjectURL(blob);
            const downloadAnchor = document.createElement('a');
            downloadAnchor.href = downloadUrl;
            downloadAnchor.download = download_filename;
            
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            
            // Clean up memory
            document.body.removeChild(downloadAnchor);
            URL.revokeObjectURL(downloadUrl);
            console.log("Download complete!");
        };
        const remote_url = API_BASE_URL_9081 + '/filesystem/download-chunk?name=' + filename;
        const response = await fetch(remote_url);
        
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        // 2. Get the stream reader and content length
        const reader = response.body.getReader();
        const contentLength = +response.headers.get('Content-Length');
        let download_filename = response.headers.get('filename'); 
        if (download_filename == null){
        download_filename = filename;
        }  
        let receivedLength = 0;
        const chunks = []; 
        response.headers.forEach((value, key) => {
        console.log(`${key}: ${value}`);
        });

        // 3. Read the stream chunk-by-chunk
        while(true) {
        const {done, value} = await reader.read();
        
        if (done) {
            break;
        }

        chunks.push(value);
        receivedLength += value.length;

        // Log progress if Content-Length header is present
        if (contentLength) {
            const progressx = ((receivedLength / contentLength) * 100).toFixed(2);
            // console.log(`Download progress: ${progressx}%`);
            console.log("download_chunk-progressx=" + progressx);
            onProgress(progressx);
        }
        }

        // 4. Combine chunks into a single Blob
        const blob = new Blob(chunks, { type: "application/octet-stream" });
        createDownload(blob,download_filename);
    },
    getVideoUploadPath: () => callRemote(API_BASE_URL_9082 + '/filesystem/upload_target_path'),
    getAudioList: () => callRemote(API_BASE_URL_9082 + '/filesystem/video/audio_list'),
};

export default api;

