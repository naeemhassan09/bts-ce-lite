import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import  './dashboard.css';
import { connect } from 'react-redux';
import { addTab } from '../layout/uilayout-actions';
import { Icon, Toaster, Intent } from "@blueprintjs/core";

const { shell } = window.require('electron').remote;
const log = window.require('electron-log');
const fs = window.require('fs');

class Dashboard extends React.Component {
    
    static icon = "home";
    static label = "Home"
    
    constructor(props){
        super(props);
        
        this.addTab = this.addTab.bind(this);
		
		this.toaster = new Toaster();

    }
    
    addTab = (options) => (e) => { 
        e.preventDefault();

        let tabId = options.component;
        this.props.dispatch(addTab(tabId, options.component, {title: options.title}));
    }
	
	showLogFile = (e) => {
		const logPath = log.transports.file.findLogPath()
		if (!fs.existsSync(logPath)) {
			log.warn(`[dashboard] ${logPath} does not exist.`)
			this.toaster.show({
                icon: "info-sign",
                intent: Intent.WARNING,
                message: "${logPath} does nit exist.",
			});
			return;
		}
		shell.openItem(logPath)
	}
    
    render(){   
        return (

            <div>
                <fieldset className="col-md-12 fieldset">    	
                    <legend className="legend">Radio Access Network</legend>
                    
                        <div className="row dashboard-icon">
                            <div className="col-md-2">
                            <div className="icon-display"><a title="Process CM dumps" href="#/parsecmdumps" 
                                onClick={this.addTab({
                                component: 'ProcessCMDumps',
                                title: 'Process CM dumps'
                                })}> <FontAwesomeIcon icon="asterisk"/></a></div>
                                <div className="icon-label">Process CM dumps</div>
                            </div>

                            <div className="col-md-2">
								<div className="icon-display"><a title="Reports" href="#/reports" 
									> <FontAwesomeIcon icon="table"/></a></div>
                                <div className="icon-label">Reports</div>
                            </div>
							
                            <div className="col-md-2">
                            </div>

                            <div className="col-md-2">
                            </div>

                            <div className="col-md-2">
                            </div>
                            
                            <div className="col-md-2">
                            </div>
                        </div>        

                </fieldset>		
               
                <fieldset className="col-md-12 fieldset">    	
                    <legend className="legend">System</legend>
                    
                    <div className="row dashboard-icon">

                        <div className="col-md-2">
                            <div className="icon-display"><a title="Profile" href="#/profile"><FontAwesomeIcon icon="user"/></a></div>
                            <div className="icon-label">Profile</div>
                        </div>

                        <div className="col-md-2">
                            <div className="icon-display"><a title="Help" href="#/help" onClick={this.addTab({
                                component: 'Help', title: 'Help'})}><FontAwesomeIcon icon="question-circle"/></a></div>
                            <div className="icon-label">Help</div>
                        </div>

                        <div className="col-md-2">
                            <div className="icon-display"><a title="Log file" href="#/" onClick={this.showLogFile.bind(this)}><FontAwesomeIcon icon="file-alt"/></a></div>
                            <div className="icon-label">Log file</div>
                        </div>
                        <div className="col-md-2">
                        </div>
                    </div>
                </fieldset>
            </div>
        );
    }
    
}

//function mapStateToProps(state) {
//  return {
//    tabs: state.tabs
//  }
//}
//
//export default connect(mapStateToProps)(Dashboard);
    
export default connect()(Dashboard)