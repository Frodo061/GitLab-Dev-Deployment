# How to deploy GitLab

https://docs.gitlab.com/ee/install/installation.html

## Host Machine (steps)

```bash
# create Vagrantfile for VM configuration
vagrant init

# edit file
vim Vagrantfile

# create and run
vagrant up
# to turn off machine
#	vagrant halt gitlabVM
# to destroy
#	vagrant destroy gitlabVM

# check global status
vagrant global-status

# access via ssh to the machine
vagrant ssh gitlabVM
```

## Remote Machine (steps)

```bash
# Setting for the new UTF-8 terminal support
sudo locale-gen en_US en_US.UTF-8 pt_PT.UTF-8

# use vim as default
sudo update-alternatives --set editor /usr/bin/vim.basic

# install a mail server
sudo apt-get install -y postfix

# install ruby
sudo apt-get install -y ruby-full

# install Blunder Gem
sudo gem install bundler --no-ri --no-rdoc

# install Go
sudo rm -rf /usr/local/go
curl --remote-name --progress https://dl.google.com/go/go1.10.3.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.10.3.linux-amd64.tar.gz
sudo ln -sf /usr/local/go/bin/{go,godoc,gofmt} /usr/local/bin/
rm go1.10.3.linux-amd64.tar.gz

# install Node.js
curl --location https://deb.nodesource.com/setup_8.x | sudo bash -
sudo apt-get install -y nodejs
sudo apt-get install -y gcc g++ make
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install yarn

# create a git user for GitLab
sudo adduser --disabled-login --gecos 'GitLab' git

# create database
sudo -u postgres psql -d template1 -c "CREATE USER git CREATEDB;"
sudo -u postgres psql -d template1 -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
sudo -u postgres psql -d template1 -c "CREATE DATABASE gitlabhq_production OWNER git;"

# download (~500MB) GitLab into home directory of the user "git"
cd /home/git
sudo -u git -H git clone https://gitlab.com/gitlab-org/gitlab-ce.git -b 11-4-stable gitlab

# configure GitLab
cd /home/git/gitlab
sudo -u git -H cp config/gitlab.yml.example config/gitlab.yml
sudo -u git -H editor config/gitlab.yml
sudo -u git -H cp config/secrets.yml.example config/secrets.yml
sudo -u git -H chmod 0600 config/secrets.yml
sudo chown -R git log/
sudo chown -R git tmp/
sudo chmod -R u+rwX,go-w log/
sudo chmod -R u+rwX tmp/
sudo chmod -R u+rwX tmp/pids/
sudo chmod -R u+rwX tmp/sockets/
sudo -u git -H mkdir public/uploads/
sudo chmod 0700 public/uploads
sudo chmod -R u+rwX builds/
sudo chmod -R u+rwX shared/artifacts/
sudo chmod -R ug+rwX shared/pages/
sudo -u git -H cp config/unicorn.rb.example config/unicorn.rb
nproc
sudo -u git -H editor config/unicorn.rb
sudo -u git -H cp config/initializers/rack_attack.rb.example config/initializers/rack_attack.rb
sudo -u git -H git config --global core.autocrlf input
sudo -u git -H git config --global gc.auto 0
sudo -u git -H git config --global repack.writeBitmaps true
sudo -u git -H git config --global receive.advertisePushOptions true
sudo -u git -H cp config/resque.yml.example config/resque.yml
sudo -u git -H editor config/resque.yml

# setup PostgreSQL
sudo -u git cp config/database.yml.postgresql config/database.yml
sudo -u git -H editor config/database.yml
sudo -u git -H chmod o-rwx config/database.yml

# install gems
sudo -u git -H bundle install -j2 --deployment --without development test mysql aws kerberos

# install GitLab Shell
sudo -u git -H bundle exec rake gitlab:shell:install REDIS_URL=unix:/var/run/redis/redis.sock RAILS_ENV=production SKIP_STORAGE_VALIDATION=true
sudo -u git -H editor /home/git/gitlab-shell/config.yml

# install gitlab-workhorse
sudo -u git -H bundle exec rake "gitlab:workhorse:install[/home/git/gitlab-workhorse]" RAILS_ENV=production

# install Gitaly
sudo -u git -H bundle exec rake "gitlab:gitaly:install[/home/git/gitaly,/home/git/repositories]" RAILS_ENV=production
sudo chmod 0700 /home/git/gitlab/tmp/sockets/private
sudo chown git /home/git/gitlab/tmp/sockets/private
cd /home/git/gitaly
sudo -u git -H editor config.toml

# initialize Database and Activate Advanced Features
cd /home/git/gitlab
sudo -u git -H bundle exec rake gitlab:setup RAILS_ENV=production force=yes
```