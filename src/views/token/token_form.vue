<template>
    <div>
        <b-card>
            <div class="row">
                <div class="col-md-6">

                    <b-form-fieldset description="Please enter an token name" label="Name" :horizontal="false">
                        <b-form-input type="text" placeholder="Enter Token Name" v-model="token.name"></b-form-input>
                    </b-form-fieldset>

                    <b-form-fieldset description="Please enter a secret" label="Secret" :horizontal="false">
                        <b-form-input type="text" placeholder="Enter Secret" v-model="token.secret"></b-form-input>
                    </b-form-fieldset>

                    <span v-if="token && token.token">
                        <b-form-fieldset description="Token" label="Secret" :horizontal="false">
                            <b-form-input type="text" placeholder="Token" disabled v-model="token.token"></b-form-input>
                        </b-form-fieldset>
                    </span>

                    <div>
                        <b-form-fieldset label="Expires On" :horizontal="false">
                            <div @click="onChangeDate">
                                <date-picker class="form-control" :config="dateTimePicker" placeholder="Select date" v-model="date"></date-picker>
                            </div>
                            <b-form-checkbox v-model="token.expires" @change="onChangeExpiryDate">Non Expiring Token</b-form-checkbox>
                        </b-form-fieldset>
                    </div>

                </div>

                <div class="col-md-6">
                    <b-form-fieldset label="Status" :horizontal="false">
                        <b-form-checkbox v-model="token.enabled">enabled</b-form-checkbox>
                    </b-form-fieldset>
                    <span v-if="tokenId">
                        <b-form-fieldset label="Roles" :horizontal="false">
                            <ul class="list-inline row-fluid">
                                <li class="list-inline-item col-md-3" v-for="role in selectedPermission" :key="role.name">
                                    <b-form-checkbox v-model="selectedRoles" :plain="true" :value="role">
                                        <span :title="role.name">{{ role.name.length > 12 ? role.name.substr(0, 10) + '..' : role.name }}</span>
                                    </b-form-checkbox>
                                </li>
                            </ul>
                        </b-form-fieldset>
                    </span>
                </div>
            </div>
            <!--/.row-->

            <div class="row">
                <div class="col-md-12">
                    <div slot="footer">
                        <b-button type="submit" size="sm" variant="primary" class="float-right" @click="save">
                            <i class="fa fa-dot-circle-o"></i> Save
                        </b-button>
                        &nbsp;
                        <b-button type="reset" size="sm" variant="danger" class="float-right" @click="cancel">
                            <i class="fa fa-ban"></i> Cancel
                        </b-button>
                    </div>
                </div>
              <!--/.col-->
            </div>
            <!--/.row-->
        </b-card>

        <!-- roles -->
        <span v-if="addRoles">
            <b-card>
                <div slot="header" class="row">
                    <div class="col-md-6 float-left">
                        <h5>Roles</h5>
                    </div>
                    <div class="col-md-6 float-right">
                        <div class="text-right">
                            <b-button class="btn btn-primary" @click="onCreateRoleButton">Add Role</b-button>
                        </div>
                    </div>
                </div>
                <div>
                    <b-table no-local-sorting small responsive show-empty :items="roles" :fields="rolesFields">
                        <template slot="permission" scope="row">
                            <b-form-select variant="outline-secondary" class="mr-3" v-model="row.item.permission" :options="permissions"> </b-form-select>
                        </template>
                        <template slot="ownership" scope="row">
                            <b-form-select variant="outline-secondary" class="mr-3" v-model="row.item.ownership" :options="ownership"> </b-form-select>
                        </template>
                        <template slot="subject" scope="row">
                            <b-form-select variant="outline-secondary" class="mr-3" v-model="row.item.subject" :options="subjectTypes"> </b-form-select>
                        </template>
                    </b-table>
                </div>
                <div class="row" slot="footer">
                    <div class="float-right">
                        <b-button type="submit" size="sm" variant="primary" class="float-right" @click="SavePermissions">
                            <i class="fa fa-dot-circle-o"></i> Save
                        </b-button>
                        &nbsp;
                        <b-button type="reset" size="sm" variant="danger" class="float-right" @click="cancel">
                            <i class="fa fa-ban"></i> Cancel
                        </b-button>
                    </div>
                </div>
            </b-card>
        </span>
    </div>
</template>

<script>
import datePicker from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';

export default {
    name: 'token_form',
    data() {
        return {
            loading: false,
            error: false,
            tokenId: null,
            // ...defaultData()
            date: null,
            token: {
                name: null,
                token: null,
                deviceId: null,
                secret: null,
                enabled: false,
                expires: null,
                owner: null
            },
            dateTimePicker: {
                enableTime: true,
                altInput: true,
                defaultDate: new Date(),
                minDate: 'today'
            },
            selectedPermission: [],
            permissions: [],
            // roles
            rolesFields: [
                {
                    key: 'permission',
                    label: 'Permission'
                },
                {
                    key: 'ownership',
                    label: 'Ownership'
                },
                {
                    key: 'subject',
                    label: 'Subject'
                }
            ],
            roles: [],
            selectedRoles: [],
            // for collapse
            addRoles: false,
            ownership: [{value: 'own', text: 'OWN (Owned devices)'}],
            subjectTypes: [{value: 'device', text: 'Device'},
                           {value: 'user', text: 'User'},
                           {value: 'app', text: 'Application'},
                           {value: 'tree', text: 'Tree'},
                           {value: 'stream', text: 'Stream (Data)'},
                           {value: 'token', text: 'Token (used to query API)'},
                           {value: 'client', text: 'OAuth2 Client'}],
        }
    },
    components: {
        datePicker
    },
    mounted() {
        if (this.$route.params.tokenId) {
            this.$log.debug('Load %s ', this.$route.params.tokenId)
            this.tokenId = this.$route.params.tokenId
            this.load(this.$route.params.tokenId)
        }
        Object.values(this.$raptor.permissions).forEach((e) => {
            if(e == 'administration')
                e = 'admin'
            this.permissions.push({value:e, text:e})
        })
    },
    methods: {
        load(tokenId) {
            this.loading = true
            this.$raptor.Admin().Token().read(tokenId)
            .then((token) => {
                this.$log.debug('Token %s loaded', tokenId)
                this.loading = false
                this.token = token
                this.token.owner = token.owner
                let tokenExpiresDate = new Date()
                // this.date = tokenExpiresDate.setMilliseconds(tokenExpiresDate.getMilliseconds() + token.expires)
                this.date = token.expires
                this.loadPermissions(token)
            })
            .catch((e) => {
                this.$log.debug('Failed to load token')
                this.$log.error(e)
                this.loading = false
                if (e.code === 401) {
                    this.$raptor.Auth().logout();
                    this.$router.push("/pages/login");
                }
            })
        },
        loadPermissions (tok) {
            this.addRoles = true
            this.$raptor.Admin().Token().Permission().get(tok)
            .then((permission) => {
                if(permission) {
                    this.selectedPermission = permission
                    this.selectedRoles = permission
                }
            })
            .catch((e) => {
                this.$log.debug('Failed to load permission')
                this.$log.error(e)
                this.loading = false
                if (e.code === 401) {
                    this.$raptor.Auth().logout();
                    this.$router.push("/pages/login");
                }
            })
        },
        cancel() {
            this.$router.push("/admin/tokens")
        },
        save() {
            let today = new Date()
            let selectedDate = new Date(this.date)
            // console.log("selected date: " + this.date + " sec: " + (new Date(this.date)).getTime() + " today: " + today)
            // total time when it will exprie - years days
            // this.token.expires = Math.abs((selectedDate.getTime() - today.getTime()));
            this.token.expires = selectedDate.getTime()
            this.$log.debug('Saving token', this.token)
            this.$raptor.Admin().Token().save(this.token)
            .then((tok) => {
                this.$log.debug('Token %s saved', tok.id)
                this.loading = false
                this.loadPermissions(tok)
                this.token = tok
                this.token.owner = tok.owner
                this.loadPermissions(tok)
                // this.$router.push("/admin/tokens")
            })
            .catch((e) => {
                this.$log.debug('Failed to save token')
                this.$log.error(e)
                this.loading = false
                if (e.code === 401) {
                    this.$raptor.Auth().logout();
                    this.$router.push("/pages/login");
                }
            })
        },
        SavePermissions() {
            let finalRoles = []
            for (var i = 0; i < this.roles.length; i++) {
                let role
                if(this.roles[i].ownership) {
                    role = this.roles[i].permission + '_' + this.roles[i].ownership + '_' + this.roles[i].subject
                } else {
                    role = this.roles[i].permission + '_' + this.roles[i].subject
                }
                finalRoles.push(role)
            }
            finalRoles = finalRoles.concat(this.selectedRoles)
            this.$raptor.Admin().Token().Permission().set(this.token,finalRoles)
            .then((p) => {
                this.$log.debug('Permissions saved')
                this.$router.push("/admin/tokens")
            })
            .catch((e) => {
                this.$log.debug('Failed to save token')
                this.$log.error(e)
                this.loading = false
                if (e.code === 401) {
                    this.$raptor.Auth().logout();
                    this.$router.push("/pages/login");
                }
            })
        },
        onChangeExpiryDate(event) {
            if(this.token.expires) {
                this.date = 0;
            }
        },
        onChangeDate(event) {
            this.token.expires = false;
        },
        // roles creation
        onCreateRoleButton() {
            this.roles.push({permission: null, onwership: null, subject: null})
        },
    }
}
</script>
