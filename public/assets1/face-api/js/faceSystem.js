$(document).ready(function(){

    console.log("document ready");
    var web_origin = document.getElementById("origin").value;
                
    async function face(){

        console.log("Function triggered")
        
        const MODEL_URL = web_origin+'/static/face-api/models'

        await faceapi.loadSsdMobilenetv1Model(MODEL_URL)
        await faceapi.loadFaceLandmarkModel(MODEL_URL)
        await faceapi.loadFaceRecognitionModel(MODEL_URL)
        await faceapi.loadFaceExpressionModel(MODEL_URL)

        const img= document.getElementById('originalImg')
        let faceDescriptions = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors().withFaceExpressions()
        // const canvas = $('#reflay').get(0)
        // faceapi.matchDimensions(canvas, img)

        faceDescriptions = faceapi.resizeResults(faceDescriptions, img)
        // faceapi.draw.drawDetections(canvas, faceDescriptions)
        // faceapi.draw.drawFaceLandmarks(canvas, faceDescriptions)
        // faceapi.draw.drawFaceExpressions(canvas, faceDescriptions)

        
        const labels = ['ross', 'rachel', 'chandler', 'monica', 'phoebe', 'joey', 'auddy']

        const labeledFaceDescriptors = await Promise.all(
            labels.map(async label => {

                const imgUrl = `${web_origin}/static/face-api/images/${label}.jpg`
                const img = await faceapi.fetchImage(imgUrl)
                
                const faceDescription = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
                
                if (!faceDescription) {
                    throw new Error(`no faces detected for ${label}`)
                }
                
                const faceDescriptors = [faceDescription.descriptor]
                return new faceapi.LabeledFaceDescriptors(label, faceDescriptors)
            })
        );

        const threshold = 0.6
        const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, threshold)

        const results = faceDescriptions.map(fd => faceMatcher.findBestMatch(fd.descriptor))
        console.log(results);
        // results.forEach((bestMatch, i) => {
        //     const box = faceDescriptions[i].detection.box
        //     const text = bestMatch.toString()
        //     const drawBox = new faceapi.draw.DrawBox(box, { label: text })
        //     drawBox.draw(canvas)
        // })

    }
    
    document.getElementById("classify").addEventListener('click', function(){
        face();
    });
})