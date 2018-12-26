external_url "http://35.229.124.203"
nginx['listen_port'] = 80

# REDIS
redis['enable'] = false
gitlab_rails['redis_host'] = '10.240.0.12'
gitlab_rails['redis_port'] = 6379
gitlab_rails['redis_password'] = 'redis-password-goes-here'

# REDIS SENTINEL
redis['master_name'] = 'gitlab-redis'
redis['master_password'] = 'redis-password-goes-here'

gitlab_rails['redis_sentinels'] = [
  {'host' => '10.240.0.12', 'port' => 26379},
  {'host' => '10.240.0.13', 'port' => 26379},
  {'host' => '10.240.0.14', 'port' => 26379}
]

# DATABASE
postgresql['enable'] = false

gitlab_rails['db_host'] = '10.240.0.8'
gitlab_rails['db_port'] = 6432
gitlab_rails['db_password'] = 'gitlab'

#gitlab_rails['initial_root_password'] = 'gitlab123456789'
#gitlab_rails['auto_migrate'] = false

# NFS
high_availability['mountpoint'] = '/gitlab-nfs'
git_data_dirs({"default" => { "path" => "/gitlab-nfs/gitlab-data/git-data"} })
user['home'] = '/gitlab-nfs/gitlab-data/home'
gitlab_rails['uploads_directory'] = '/gitlab-nfs/gitlab-data/uploads'
gitlab_rails['shared_path'] = '/gitlab-nfs/gitlab-data/shared'
gitlab_ci['builds_directory'] = '/gitlab-nfs/gitlab-data/builds'


# SMTP
gitlab_rails['smtp_enable'] = true
gitlab_rails['smtp_address'] = "smtp.mailtrap.io"
gitlab_rails['smtp_port'] = 465
gitlab_rails['smtp_user_name'] = "511d4659f8686f"
gitlab_rails['smtp_password'] = "b64861b35ad7e6"
gitlab_rails['smtp_domain'] = "smtp.mailtrap.io"
gitlab_rails['smtp_tls'] = true
