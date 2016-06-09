var React = require('react');

var ReactDOM = require('react-dom');
var JSONSchemaForm = require('react-jsonschema-form');
var DCOIschema = require('./js/schema.js');
var formUiSchema = require('./js/uiSchema.js');
var dummyData = require('./js/dummy.js');

const Form = JSONSchemaForm.default;

// var version = require('../package.json').version;
var version = '0.0.1';

function walk(schema, uiSchema, formData) {
    if (schema.hasOwnProperty('properties')) {
        for (var key in schema.properties) {
            if (schema.properties.hasOwnProperty(key)){
                uiSchema[key] = uiSchema[key] || {};
                if (schema.properties[key].hasOwnProperty('properties')) {
                    formData[key] = formData[key] || {};
                } else {
                    if (schema.properties[key].hasOwnProperty('minimum') && schema.properties[key].hasOwnProperty('maximum')){
                        if (schema.properties[key].minimum == schema.properties[key].maximum) {
                            formData[key] = schema.properties[key].minimum;
                        }
                    }
                }
                walk(schema.properties[key], uiSchema[key], formData[key]);
            }
        }
    } else {
        if (schema.hasOwnProperty('description')) {
            uiSchema['ui:help'] = uiSchema['ui:help'] || schema.description;
            schema.description = '';
        }
    }

}

const initialFormData = {};

walk(DCOIschema, formUiSchema, initialFormData);

console.log(formUiSchema);
console.log(initialFormData);

// Covering browsers without Object.assign support (IE 9-11)
require('./js/polyfill.js');

var App = React.createClass({
    displayName: 'App',

    getInitialState: function () {
        return {
            schema: DCOIschema,
            uiSchema: formUiSchema,
            formData: initialFormData,
            liveValidate: true,
            output: '',
            inputForm: ''
        };
    },

    generateJson: function (data) {
        var out = React.createElement('textarea', {
            className: "form-control",
            value: JSON.stringify(data.formData, null, '\t'),
            readOnly: true
        });
        this.setState({output: out});
    },

    loadDummyData: function () {
        if (this.state.formData == initialFormData || confirm('Your form data will be replaced with dummy data, so your changes will be lost. Are you sure you want to proceed?')) {
            this.setState({formData: dummyData});
        }
    },

    loadMyData: function() {
        var data = JSON.parse(document.getElementById("json-input").value);
        this.setState({formData: data, inputForm: ''});
    },

    showLoadMyDataForm: function() {
        const myDataForm = React.createElement("div",
            {className: "form-group field field-object"},
            React.createElement("h4",
                {}, "Please enter your json:"
            ),
            React.createElement("textarea",
                {
                    className: "form-control",
                    id: "json-input"
                }
            ),
            React.createElement("div",
                {className: "text-center"},
                React.createElement("button",
                    {
                        onClick: this.loadMyData,
                        className: "btn btn-primary"
                    },
                    "Load data"
                ))
        );
        this.setState({inputForm: myDataForm});
    },

    onFormDataChange: function(obj){
        this.setState({formData: obj.formData, output:''})
    },

    render: function render() {
        const {
            schema,
            uiSchema,
            formData,
            liveValidate,
            output,
            inputForm
        } = this.state;

        return React.createElement(
            'div',
            {className: 'container'},
            [
                React.createElement(
                    'div',
                    {
                        id: 'controls',
                        className: 'row',
                        key: 'ctrls'
                    },
                    React.createElement("button", {
                        className: "btn btn-danger pull-right",
                        onClick: this.loadDummyData,
                        key: 'dummy'
                    }, "Load dummy data (test)"),
                    React.createElement("button", {
                        className: "btn btn-primary pull-left",
                        onClick: this.showLoadMyDataForm,
                        key: 'mydata'
                    }, "Load my own data")
                ),
                React.createElement(
                    'div',
                    {
                        id: 'input',
                        className: 'row my-data',
                        key: 'input'
                    },
                    inputForm
                ),
                React.createElement(
                    Form,
                    {
                        schema: schema,
                        uiSchema: uiSchema,
                        formData: formData,
                        liveValidate: liveValidate,
                        onChange: this.onFormDataChange,
                        onSubmit: this.generateJson,
                        key: 'form'
                    }
                ),
                React.createElement(
                    'div',
                    {
                        id: 'out',
                        className: 'row out',
                        key: 'out'
                    },
                    output
                )
            ]
        );
    }
});

ReactDOM.render(React.createElement(
    App
), document.getElementById('app'));

(0, ReactDOM.render)(
    React.createElement("em", {}, "version "+version)
    , document.getElementById("version"));