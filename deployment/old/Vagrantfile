PUBLIC_KEY = File.read(File.expand_path('~/.ssh/id_rsa.pub')).strip
Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/xenial64"
  config.vm.provider "virtualbox" do |vb|
    vb.memory = "512"
    vb.cpus = 1
  end
  config.vm.provision "shell", inline: <<-SHELL
        echo "#{PUBLIC_KEY}" >> /home/ubuntu/.ssh/authorized_keys
        apt-get -y update
        apt-get -y upgrade
        apt-get -y autoremove
        apt-get install -y vim
      SHELL
    config.vm.define "vm1" do |vm1|
      vm1.vm.network "private_network", ip: "10.0.0.101"
    end
    config.vm.define "vm2" do |vm2|
      vm2.vm.network "private_network", ip: "10.0.0.102"
    end
    config.vm.define "vm3" do |vm3|
      vm3.vm.network "private_network", ip: "10.0.0.103"
    end
end