# Application servers connect to PgBouncer default port
# PgBouncer connects to the primary database servers PostgreSQL default port
# Repmgr connects to the database servers PostgreSQL default port
# Postgres secondaries connect to the primary database servers PostgreSQL default port
# Consul servers and agents connect to each others Consul default ports



# > CONSUL
# ------------------------------------------------
# USERNAME: gitlab-consul
# PASSWORD: gitlab-consul
# PASSWORD_HASH: bc175b38365ec8781fa93720255dee85
# ------------------------------------------------
# sudo mv /etc/gitlab/gitlab.rb /etc/gitlab/gitlab.rb.bak
# sudo vim /etc/gitlab/gitlab.rb
# sudo gitlab-ctl reconfigure
# /opt/gitlab/embedded/bin/consul members
# ------------------------------------------------
roles ['consul_role']

consul['configuration'] = {
    server: true,
    retry_join: %w(192.168.0.2 192.168.0.3 192.168.0.4)
}

gitlab_rails['auto_migrate'] = false


# > DataBase Master
# ------------------------------------------------
# USERNAME: gitlab
# PASSWORD: gitlab-consul
# PASSWORD_HASH: b7a289c0600988fe8e709dd2887e4d37
# ------------------------------------------------
# export LC_CTYPE=en_US.UTF-8
# export LC_ALL=en_US.UTF-8
# sudo dpkg-reconfigure locales
# ------------------------------------------------
roles ['postgres_role']

postgresql['listen_address'] = '0.0.0.0'
postgresql['hot_standby'] = 'on'
postgresql['wal_level'] = 'replica'
postgresql['shared_preload_libraries'] = 'repmgr_funcs'

gitlab_rails['auto_migrate'] = false
consul['services'] = %w(postgresql)

postgresql['pgbouncer_user_password'] = 'be5544d3807b54dd0637f2439ecb03b9'
postgresql['sql_user_password'] = 'b7a289c0600988fe8e709dd2887e4d37'
postgresql['max_wal_senders'] = 4

postgresql['trust_auth_cidr_addresses'] = %w(192.168.0.0/16)
repmgr['trust_auth_cidr_addresses'] = %w(127.0.0.1/32 192.168.0.0/16)

consul['configuration'] = {
    retry_join: %w(192.168.0.5 192.168.0.6 192.168.0.7)
}

# > DataBase Secondary/Slaves
# ------------------------------------------------
roles ['postgres_role']

postgresql['listen_address'] = '0.0.0.0'
postgresql['hot_standby'] = 'on'
postgresql['wal_level'] = 'replica'
postgresql['shared_preload_libraries'] = 'repmgr_funcs'

gitlab_rails['auto_migrate'] = false
consul['services'] = %w(postgresql)

postgresql['pgbouncer_user_password'] = 'be5544d3807b54dd0637f2439ecb03b9'
postgresql['sql_user_password'] = 'b7a289c0600988fe8e709dd2887e4d37'
postgresql['max_wal_senders'] = 4

postgresql['trust_auth_cidr_addresses'] = %w(192.168.0.0/16)
repmgr['trust_auth_cidr_addresses'] = %w(127.0.0.1/32 192.168.0.0/16)

consul['configuration'] = {
    retry_join: %w(192.168.0.5 192.168.0.6 192.168.0.7)
}

repmgr['master_on_initialization'] = false

# Database
# 192.168.0.5 database-master.us-west1-b.c.copper-gear-221110.internal database-master
# 192.168.0.6 database-1.us-west1-b.c.copper-gear-221110.internal database-1
# 192.168.0.7 database-2.us-west1-b.c.copper-gear-221110.internal database-2
# Post configuration
# Master
# ------------------------------------------------
# sudo gitlab-psql -d gitlabhq_production
# sudo gitlab-ctl repmgr cluster show
# Secondary
# ------------------------------------------------
# sudo gitlab-ctl repmgr standby setup database-master.us-west1-b.c.copper-gear-221110.internal
# sudo gitlab-ctl repmgr cluster show


# pgbouncer
# In a High Availability setup, Pgbouncer is used to seamlessly migrate database connections between servers in a failover scenario.
# ------------------------------------------------
# USERNAME: pgbouncer
# PASSWORD: pgbouncer
# PASSWORD_HASH: be5544d3807b54dd0637f2439ecb03b9
# ------------------------------------------------
roles ['pgbouncer_role']

pgbouncer['admin_users'] = %w(pgbouncer gitlab-consul)

consul['watchers'] = %w(postgresql)

pgbouncer['users'] = {
    'gitlab-consul': {
        password: 'bc175b38365ec8781fa93720255dee85'
    },
    'pgbouncer': {
        password: 'be5544d3807b54dd0637f2439ecb03b9'
    }
}

consul['configuration'] = {
    retry_join: %w(192.168.0.5 192.168.0.6 192.168.0.7)
}

# sudo  gitlab-ctl write-pgpass --host 127.0.0.1 --database pgbouncer --user pgbouncer --hostuser gitlab-consul
# pgbouncer
# sudo gitlab-ctl pgb-console