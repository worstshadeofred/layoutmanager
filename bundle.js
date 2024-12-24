$(document).ready(function(){
    var currentPaperSize = "A4";
    var frame = $("iframe"),
        contents = frame.contents(),
        body = contents.find('body'),
        paper_size_selector = $("#paper-size-select")
    contents.find('head').append("<link href='https://fonts.googleapis.com/icon?family=Material+Icons' rel='stylesheet'>");
    body.append("<script src='closehandler.js'><\/script>");
    body.append("<style type='text/css'> body{overflow:hidden;} .img-remove{backdrop-filter:blur(10px);align-items:center;color:white;font-size:100%;display:flex;justify-content:center;z-index:2;width:4%;aspect-ratio:1;position:absolute;top:3%;right:5%;padding:2px;cursor:pointer;} @media print {.upimg{resize: none !important;} .img-remove{visibility:hidden;}}</style>")
    body.append("<div style='width:100%;height:100%;display:flex;flex-direction:row;flex-wrap:wrap;gap:0.5%;align-content:flex-start;justify-content:flex-start;align-items:flex-start'></div>");
    body.css({"margin":"0","padding-top":"8%","padding-bottom":"8%","padding-right":"8%","padding-left":"8%"})

    var frameDiv = frame.contents().find('div');
    const expectedSizes = new WeakMap();
    
    const myObserver = new MutationObserver(entries => {
        for (const entry of entries){
            const expectedSize = expectedSizes.get(entry.target);
            if (entry.target.style.width.toString().indexOf("%") >= 0) {
                continue;
            }
            var inhtml = entry.target;
            var newSize = null;
            var currentWidth = parseFloat(inhtml.style.width)
            if (currentWidth < frameDiv.width()){
                newSize = currentWidth/frameDiv.width()*100+"%";
            } else if (currentWidth >= frameDiv.width()){
                newSize = "100%";
            }
            inhtml.style.width = newSize;
            expectedSizes.set(entry.target, newSize);
            
        }
    });
    $.getAspectRatio = function(image){
        console.log(image.naturalWidth);
        const w = image.naturalWidth;
        const h = image.naturalHeight;

        let aspectRatio;

        aspectRatio = w / h;

        return aspectRatio;
    }

    $.changePaperSize = function(){
        if (currentPaperSize=="A4"){
            frame.css({"aspect-ratio": "1/1.414"});
            body.css({"aspect-ratio": "1/1.414"});
        } else if (currentPaperSize=="Letter"){
            frame.css({"aspect-ratio": "8.5/11"});
            body.css({"aspect-ratio": "8.5/11"});
        } else if (currentPaperSize=="Legal"){
            frame.css({"aspect-ratio": "8.5/13"});
            body.css({"aspect-ratio": "8.5/13"});
        }
    }
    $("body").on('dragenter', function(event){
        event.preventDefault();
        event.stopImmediatePropagation();
        $("#drop-area").css({"visibility":"visible"});
        
    });
    $("body").on('dragover', function(event){
        event.preventDefault();
        event.stopImmediatePropagation();
    });
    $("#drop-area").on('dragleave', function(event){
        event.preventDefault();
        event.stopImmediatePropagation();
        $("#drop-area").css({"visibility":"hidden"});
        
    });
    $.handleFiles = function(fileList){
        for (var i =0;i<fileList.length;i++){
            var oFReader = new FileReader(), 
            rFilter = /^(?:image\/bmp|image\/cis\-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x\-cmu\-raster|image\/x\-cmx|image\/x\-icon|image\/x\-portable\-anymap|image\/x\-portable\-bitmap|image\/x\-portable\-graymap|image\/x\-portable\-pixmap|image\/x\-rgb|image\/x\-xbitmap|image\/x\-xpixmap|image\/x\-xwindowdump)$/i;
            var oFile = fileList[i];
            if (!rFilter.test(oFile.type)) { 
                alert("You must select a valid image file!"); 
                return; 
            }
            oFReader.readAsDataURL(oFile);
            oFReader.onload = function(readEvent){
                var imageElement = new Image()
                imageElement.src = readEvent.target.result;
                imageElement.onload = function(){
                    var aspectRatioGot = $.getAspectRatio(imageElement);
                    var element = $("<div style='position:relative;width:20%;height:auto;overflow:auto;aspect-ratio:"+aspectRatioGot.toString()+";resize:horizontal;user-select:none;moz-user-select:none;'><img style='width:100%;height:100%;max-width:100%;max-height:100%;object-fit:cover;user-select:none;moz-user-select:none;' draggable = 'false' src="+readEvent.target.result+"><div onclick='removeIMG(this)' class='img-remove material-icons'>cancel</div></div>").addClass("upimg");
                    frameDiv.append(element);
                }
            }
        }
        setTimeout(() => {
            var children = frameDiv.children('div');
            console.log(children.length);
            myObserver.disconnect();
            for(var i = 0;i < children.length;i++){
                myObserver.observe(children[i], {attributes: true});
        }
        }, 100);
    }
    $("#drop-area").on('drop', function(event){
        event.preventDefault();
        event.stopImmediatePropagation();
        $("#drop-area").css({"visibility":"hidden"});
        if (event.originalEvent.dataTransfer.files.length === 0) { 
            return; 
        }
        $.handleFiles(event.originalEvent.dataTransfer.files);
    }); 
    $("#upload-image-input").change(function(event){
        $.handleFiles(event.target.files);
    });
 
    $.changePaperSize();
    paper_size_selector.change(function(){
        currentPaperSize = $(this).find("option:selected").attr('value');
        $.changePaperSize();
    });
    $("#print-button").on("click", function(){
        frame.get(0).contentWindow.print();
    });
    $(body).on("paste", function(event){
        event.stopImmediatePropagation();
        event.preventDefault();
        var clipBoardData = event.originalEvent.clipboardData;
        $.handleFiles(clipBoardData.files);
    });
  
});
