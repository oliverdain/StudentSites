StudentSites
============

Creates a system so each student can build their own web site. This includes the
following pieces:

* An rsync daemon configuration so that each student can transfer data to their
  directory, and only their directory.
* A node app that serves all subdomains. The subdomain determines which
  student's app is being served.

Rsync Setup
===========

An rsyncd.conf file that looks something like:

     port = 1337
     log file = /home/ubuntu/rsync.log

     [oliver]
     path = /home/ubuntu/www/oliver
     auth users = oliver
     secrets file = /home/ubuntu/rsync.users
     use chroot = false
     read only = false

Here the port an log file are set globally. Then we have one "module" for each
user. In the above, the only user is "oliver". The "auth users" section of that
module says only the user "oliver" is allowed. Even though "use chroot" is
false, rsync will enforce that the user can't write to anything above the "path"
specified in the module (the "use chroot" indicates that as an extra precausion
we should run as root and actually chroot). The "secrets file" indicates a list
of user:password pairs (one per line) that are used for authentication.

Given this, we can start rsync like:

     rsync --daemon --config=rsyncd.conf

Node Setup
==========

The rest of the setup is a very simple node app that uses the swig template
system but dispatches based on the subdomain. That code should be fairly
self-explanitory.
