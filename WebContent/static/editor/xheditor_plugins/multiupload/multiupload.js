/*!
 * MultiUpload for xheditor
 * @requires xhEditor
 * 
 * @author Yanis.Wang<yanis.wang@gmail.com>
 * @site http://xheditor.com/
 * @licence LGPL(http://www.opensource.org/licenses/lgpl-license.php)
 * 
 * @Version: 0.9.2 (build 100505)
 */
var swfu,selQueue=[],selectID,arrMsg=[],allSize=0,uploadSize=0;
function removeFile()
{
	var file;
	if(!selectID)return;
	for(var i in selQueue)
	{
		file=selQueue[i];
		if(file.id==selectID)
		{
			selQueue.splice(i,1);
			allSize-=file.size;
			swfu.cancelUpload(file.id);
			$('#'+file.id).remove();
			selectID=null;
			break;
		}
	}
	$('#btnClear').hide();
	if(selQueue.length==0)$('#controlBtns').hide();
}
function startUploadFiles()
{
	if(swfu.getStats().files_queued>0)
	{
		$('#controlBtns').hide();
		swfu.startUpload();
	}
	else alert('�ϴ�ǰ��������ļ�');
}
function setFileState(fileid,txt)
{
	$('#'+fileid+'_state').text(txt);
}
function fileQueued(file)//������ӳɹ�
{
	for(var i in selQueue)if(selQueue[i].name==file.name){swfu.cancelUpload(file.id);return false;}//��ֹͬ���ļ��ظ����
	if(selQueue.length==0)$('#controlBtns').show();
	selQueue.push(file);
	allSize+=file.size;
	$('#listBody').append('<tr id="'+file.id+'"><td>'+file.name+'</td><td>'+formatBytes(file.size)+'</td><td id="'+file.id+'_state">����</td></tr>');
	$('#'+file.id).hover(function(){$(this).addClass('hover');},function(){$(this).removeClass('hover');})
	.click(function(){selectID=file.id;$('#listBody tr').removeClass('select');$(this).removeClass('hover').addClass('select');$('#btnClear').show();})
}
function fileQueueError(file, errorCode, message)//�������ʧ��
{
	var errorName='';
	switch (errorCode)
	{
		case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
			errorName = "ֻ��ͬʱ�ϴ� "+this.settings.file_upload_limit+" ���ļ�";
			break;
		case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
			errorName = "ѡ����ļ������˵�ǰ��С���ƣ�"+this.settings.file_size_limit;
			break;
		case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
			errorName = "���С�ļ�";
			break;
		case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
			errorName = "�ļ���չ������Ϊ��"+this.settings.file_types_description+" ("+this.settings.file_types+")";
			break;
		default:
			errorName = "δ֪����";
			break;
	}
	alert(errorName);
}
function uploadStart(file)//���ļ��ϴ���ʼ
{
	setFileState(file.id,'�ϴ��С�');
}
function uploadProgress(file, bytesLoaded, bytesTotal)//���ļ��ϴ�����
{
	var percent=Math.ceil((uploadSize+bytesLoaded)/allSize*100);
	$('#progressBar span').text(percent+'% ('+formatBytes(uploadSize+bytesLoaded)+' / '+formatBytes(allSize)+')');
	$('#progressBar div').css('width',percent+'%');
}
function uploadSuccess(file, serverData)//���ļ��ϴ��ɹ�
{
	var data=Object;
	try{eval("data=" + serverData);}catch(ex){};
	if(data.err!=undefined&&data.msg!=undefined)
	{
		if(!data.err)
		{
			uploadSize+=file.size;
			arrMsg.push(data.msg);
			setFileState(file.id,'�ϴ��ɹ�');
		}
		else
		{
			setFileState(file.id,'�ϴ�ʧ��');
			alert(data.err);
		}
	}
	else setFileState(file.id,'�ϴ�ʧ�ܣ�');
}
function uploadError(file, errorCode, message)//���ļ��ϴ�����
{
	setFileState(file.id,'�ϴ�ʧ�ܣ�');
}
function uploadComplete(file)//�ļ��ϴ����ڽ���
{
	if(swfu.getStats().files_queued>0)swfu.startUpload();
	else uploadAllComplete();
}
function uploadAllComplete()//ȫ���ļ��ϴ��ɹ�
{
	callback(arrMsg);
}
function formatBytes(bytes) {
	var s = ['Byte', 'KB', 'MB', 'GB', 'TB', 'PB'];
	var e = Math.floor(Math.log(bytes)/Math.log(1024));
	return (bytes/Math.pow(1024, Math.floor(e))).toFixed(2)+" "+s[e];
}