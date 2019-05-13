import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormGroup, InputGroup, Intent, Button, FileInput, HTMLSelect, ProgressBar, Classes   } from "@blueprintjs/core";
import { VENDOR_CM_FORMSTS, VENDOR_PARSERS } from './VendorCM.js'
import Timer from './Timer';

const { remote, ipcRenderer } = window.require("electron")
const { app, process } = window.require('electron').remote;
const { spawn } = window.require('child_process') 
const path = window.require('path')
const isDev = window.require('electron-is-dev');
const replace = window.require('replace-in-file');

export default class ProcessCMDumps extends React.Component {
        
     static icon = "asterisk";
     static label = "Process CM Dumps"
	 
	constructor(props){
		super(props);
		
		this.state = {
			outputFolderText: "Choose folder...",
			inputFileText: "Choose folder...",
			vendors: ['ERICSSON', 'HUAWEI', 'ZTE', 'NOKIA'],
			currentVendor: 'ERICSSON',
			currentFormat: 'BULKCM',
			processing: false,
			errorMessage: null,
			successMessage: null,
			infoMessage: null
			
		}
		
		this.vendorFormats = VENDOR_CM_FORMSTS
		
		this.processDumps.bind(this)
		this.dismissErrorMessage.bind(this)
		this.dismissSuccessMessage.bind(this)
		this.areFormInputsValid.bind(this)
		
		this.clearForm.bind(this)
		
		this.currentTimerValue = "00:00:00"
		
	}
	
	onOutputFolderInputChange = (e) => {
		this.setState({outputFolderText: e.target.files[0].path})
	}
	
	onInputFileChange = (e) => {
		this.setState({inputFileText: e.target.files[0].path})
	}
	
	onVendorFormatSelectChange =(e) => {
		this.setState({currentFormat: e.target.value })
	}

	onVendorSelectChange =(e) => {
		this.setState(
		{	currentVendor: e.target.value, 
			currentFormat: VENDOR_CM_FORMSTS[e.target.value][0]}
		)
	}
	
	/**
	* Validate the inputs from the form
	*/
	areFormInputsValid = () => {
		if(this.state.inputFileText === null || this.state.inputFileText === "Choose folder..."){
			this.setState({errorMessage: "Input folder is required"})
			return false
		}

		if(this.state.outputFolderText === null || this.state.outputFolderText === "Choose folder..."){
			this.setState({errorMessage: "Output folder is required"})
			return false
		}
		
		
		return true
	}
	
	
	processDumps = () => {
		
		this.setState({processing: true, errorMessage: null, successMessage: null})
		const payload = {
				"vendor": this.state.currentVendor,
				"format": this.state.currentFormat,
				"inputFolder": this.state.inputFileText,
				"outputFolder": this.state.outputFolderText
			}

		ipcRenderer.send('parse-cm-request', JSON.stringify(payload))
		
		//Wait for response
		ipcRenderer.on('parse-cm-request', (event, args) => {

			const obj = JSON.parse(args)
			if(obj.status === 'success'){
				this.setState({errorMessage: null, successMessage: obj.message, infoMessage:null, processing: false})				
			}
			
			if(obj.status === 'error'){
				this.setState({errorMessage: null, successMessage: obj.message, infoMessage:null, processing: false})				
			}
			
			if(obj.status === 'info'){
				this.setState({errorMessage: null, successMessage: null, infoMessage: obj.message})				
			}

		})
		
		return;
		
		
	}
	
	dismissErrorMessage = () => { this.setState({errorMessage: null})}
	
	dismissSuccessMessage = () => { this.setState({successMessage: null})}
	
	updateTimerValue = (hours, minutes, seconds) => { 
		this.currentTimerValue = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}` 
	} 
	
	clearForm = () => {
		this.setState({
			processing: false,
			outputFolderText: "Choose folder...",
			inputFileText: "Choose folder...",
		});
		this.currentTimerValue = "00:00:00"
		
	}
    render(){
        return (
            <div>
                <h3><FontAwesomeIcon icon="asterisk"/> Process CM Dumps</h3>

                <div className="card mb-2">
				{ this.state.processing ? <ProgressBar intent={Intent.PRIMARY} className="mt-1"/> : ""}
				
				{this.state.errorMessage !== null ? 
					<div className="alert alert-danger m-1 p-2" role="alert">
						{this.state.errorMessage}
						<button type="button" className="close"  aria-label="Close" onClick={this.dismissErrorMessage}>
                            <span aria-hidden="true">&times;</span>
                        </button>
					</div> 
					: ""}  
					
				{this.state.successMessage !== null ? 
					<div className="alert alert-success m-1 p-2" role="alert">
						{this.state.successMessage}
							<button type="button" className="close"  aria-label="Close" onClick={this.dismissSuccessMessage}>
                            <span aria-hidden="true">&times;</span>
                        </button>
					</div> 
				: ""}  
					
				{this.state.infoMessage !== null ? 
					<div className="alert alert-info m-1 p-2" role="alert">
						{this.state.infoMessage}
							<button type="button" className="close"  aria-label="Close" onClick={this.dismissSuccessMessage}>
                            <span aria-hidden="true">&times;</span>
                        </button>
					</div> 
				: ""}  
                  <div className="card-body">
                   
					<form>
					  <div className="form-group row">
						<label htmlFor="select_vendor" className="col-sm-2 col-form-label">Vendor</label>
						<div className="col-sm-10">
						  <HTMLSelect options={this.state.vendors} id="select_vendor" value={this.state.currentVendor} onChange={this.onVendorSelectChange}/>
						</div>
					  </div>
					  <div className="form-group row">
						<label htmlFor="select_file_format" className="col-sm-2 col-form-label">Format</label>
						<div className="col-sm-10">
						  <HTMLSelect id="select_file_format"options={VENDOR_CM_FORMSTS[this.state.currentVendor]} value={this.state.currentFormat} onChange={this.onVendorFormatSelectChange}/>
						</div>
					  </div>
					  <div className="form-group row">
						<label htmlFor="input_folder" className="col-sm-2 col-form-label">Input folder</label>
						<div className="col-sm-10">
						  <FileInput className="form-control" text={this.state.inputFileText} onInputChange={this.onInputFileChange} inputProps={{webkitdirectory:"", mozdirectory:"", odirectory:"", directory:"", msdirectory:""}}/>
						</div>
					  </div>
					  <div className="form-group row">
						<label htmlFor="input_folder" className="col-sm-2 col-form-label">Output folder</label>
						<div className="col-sm-10">
						  <FileInput className="form-control" text={this.state.outputFolderText} inputProps={{webkitdirectory:"", mozdirectory:"", odirectory:"", directory:"", msdirectory:""}} onInputChange={this.onOutputFolderInputChange}/>
						</div>
					  </div>
					  
					  <div className="form-group row">
						<label htmlFor="input_folder" className="col-sm-2 col-form-label"></label>
						<div className="col-sm-10">
							<Timer className={"bp3-button"} visible={this.state.processing} onChange={this.updateTimerValue.bind(this)}/>  {this.state.processing? "" : <Button text={this.currentTimerValue}/>}
						</div>
					  </div>
					  
					</form>
					
					
                  </div>
				  
                </div>
				
                    <Button icon="play" text="Process" className={Classes.INTENT_PRIMARY}  onClick={this.processDumps} disabled={this.state.processing}/> &nbsp;
					<Button text="Clear" onClick={this.clearForm} disabled={this.state.processing}/>
            </div>    
        );
    }
}