StudentSites
============

Creates a system so each student can build their own web site. This includes the
following pieces:

* A opensshd configuration so each student can sftp (and only sftp) to a
  directory where they put their files. They are chrooted so they can't get into
  any other directories. Access is mediated via public keys so it works cleanly
  with codio. Note that they aren't really ssh-ing to a "home" directory,
  they're sshing to a subdirectory of a node app.

* A node app that serves all subdomains. The subdomain determines which
  student's app is being served.
