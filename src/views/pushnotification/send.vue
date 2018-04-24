<template>
    <b-card>

        <div slot="header" class="row">
            <div class="col-md-12">
                <h5></i>Send Message to Device</h5>
            </div>
        </div>

        <div class="row">
            <div class="col-md-9">
                <div class="col-lg-12 text-left">
                    <div v-if="appId">
                        <div class="form-group" :class="{error: validation.hasError('device')}">
                            <b-form-fieldset description="Enter Device id to filter" label="Select Device">
                                 <!-- @update-items="updateItems" -->
                                <v-autocomplete :items="list" v-model="itemAutoComplete" :get-label="getLabel" :component-item='itemAutoTemplate' :input-attrs="{id: 'v-my-autocomplete'}" @item-clicked="itemClicked" @change="inputChangeEvent" :auto-select-one-item="false"></v-autocomplete>
                            </b-form-fieldset>
                        </div>
                        <div class="message text-danger">{{ validation.firstError('device') }}</div>
                    </div>
                </div>
                <div class="col-lg-12 text-left">
                    <div class="form-group" :class="{error: validation.hasError('action')}">
                      <div class="text-left">
                          <b-form-fieldset description="" label="Select Action">
                              <b-form-select :options="actionOptions" v-model="action"/>
                          </b-form-fieldset>
                      </div>
                    </div>
                    <div class="message text-danger">{{ validation.firstError('action') }}</div>
                </div>
                <div class="col-md-12 text-left">
                    <div class="form-group" :class="{error: validation.hasError('message')}">
                        <b-form-fieldset label="Message">
                            <textarea class="col-md-12" rows="8" v-model="message" placeholder="Enter message"></textarea>
                        </b-form-fieldset>
                    </div>
                    <div class="message text-danger">{{ validation.firstError('message') }}</div>
                </div>
            </div>
        </div>

        <div slot="footer">
            <div class="row">
                <div class="col-md-12 text-right">
                  <b-button variant="primary" @click="send">
                      <i class="fa fa-paper-plane-o"></i> Send
                  </b-button>
                </div>
            </div>
            <!--/.col-->
        </div>
        <!--/.row-->
    </b-card>
</template>

<script>
// auto-complete
import Vue from 'vue'
import Autocomplete from 'v-autocomplete'
import 'v-autocomplete/dist/v-autocomplete.css'
Vue.use(Autocomplete)
// item template
import ItemTemplate from './../components/ItemTemplate.vue'

// raptor
import Raptor from 'raptor-sdk'

// Validation
var SimpleVueValidation = require('simple-vue-validator');
var Validator = SimpleVueValidation.Validator;

export default {
    name: 'user_form',
    data() {
        return {
            user: null,
            loading: false,
            error: false,
            appId: null,
            deviceId: null,
            device: null,
            devices: [],
            list: [],
            action: null,
            actionOptions: [],
            message: null,
            // auto-complete item template
            itemAutoTemplate: ItemTemplate,
            itemAutoComplete: null,
        }
    },
    validators: {
        device: function(value) {
            return Validator.value(value).required('Device is required to send the message');
        },
        action: function(value) {
            return Validator.value(value).required('Action is required');
        },
        'message': function(value) {
            return Validator.value(value).required('Message is required');
        }
    },
    mounted() {
        this.user = this.$raptor.Auth().getUser()
        if(this.$route.params.appId) {
            this.appId = this.$route.params.appId
        }
        if(this.$route.params.deviceId) {
            this.deviceId = this.$route.params.deviceId
        }
        this.fetchData()
    },
    methods: {
        fetchData() {
            this.error = null
            this.loading = true
            // this.$log.debug('Fetching device list page=%s, size=%s sort=%s.%s', this.currentPage, this.perPage, this.sortBy, this.sortDir)
            let queryParam = {
                page: 0,
                size: 1000
            }
            // console.log(queryParam)
            if(this.appId) {
                this.$raptor.Inventory().search({domain: this.appId}, queryParam)
                    .then((pager) => {

                        // const list = pager.getContent()
                        this.$log.debug('Loaded %s device list', pager.getContent().length)
                        // console.log(list.length)

                        this.loading = false
                        this.pager = pager
                        this.totalRows = pager.getTotalElements()
                        this.devices = pager.getContent()
                        this.list = this.devices

                    })
                    .catch((e) => {

                        this.$log.warn('Failed to load device list: %s', e.message)
                        this.$log.debug(e)

                        this.error = e.message
                        this.list = []
                        this.pager = null
                        this.loading = false
                        if (e.code === 401) {
                            this.$raptor.Auth().logout();
                            this.$router.push("/pages/login");
                        }
                    })
            }
            if (this.deviceId) {
                this.$raptor.Inventory().read(this.deviceId)
                    .then((device) => {
                        this.loading = false
                        this.device = device
                        this.itemClicked(device)
                    })
                    .catch((e) => {
                        this.$log.warn('Failed to load device list: %s', e.message)
                        this.$log.debug(e)
                        this.error = e.message
                        this.list = []
                        this.pager = null
                        this.loading = false
                        if (e.code === 401) {
                            this.$raptor.Auth().logout();
                            this.$router.push("/pages/login");
                        }
                    })
            }
        },
        send() {
            var context = this
            this.loading = true
            this.$validate().then((success) => {
                if (!success) {
                    console.log('validation error')
                    return Promise.reject(new Error("Validation failed"))
                }
                let dev = {name: this.action, deviceId: this.device.id}
                console.log(dev)
                console.log(this.message)
                console.log(this.$raptor)
                console.log(this.$raptor.Action())
                this.$raptor.Action().invoke(dev, this.message)
                    .then((success) => {
                        console.log('sent')
                        this.$log.debug('Message sent')
                        this.loading = false
                    })
                    .catch((e) => {
                        console.log('error')
                        this.loading = false
                        this.$log.error("Error saving user: %s", e.message)
                        this.$log.debug(e)
                    })
                this.$toasted.show('Message Sent').goAway(3000)
            })
        },
        // auto-complete methods
        itemClicked(item) {
            this.device = item
            this.actionOptions = []
            if(this.device.actions) {
                let keys = Object.keys(this.device.actions)
                // console.log(keys)
                this.actionOptions.push({text: 'Please select action', value: null})
                keys.forEach((e) => this.actionOptions.push({text: e, value: e}))
                // console.log(this.actionOptions)
            }
            this.message = null
            this.action = null
        },
        inputChangeEvent(text) {
            if (text == '') {
                this.list = this.devices
            }
        },
        getLabel(item) {
            return item.name + " - " + item.id
        },
    }
}
</script>
