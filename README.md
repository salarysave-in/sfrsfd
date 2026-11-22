# Salary Save

The public directory contains the recovered web client from salarysave.in, including the account gate, budget dashboard, onboarding, and their static assets. Serve this directory at the origin root. For a local UI preview, run:

    python3 -m http.server 8080 --directory public

Google sign-in needs an authorized Firebase domain. Cloud data remains in the existing Firebase project. The browser client does not contain the hosting account configuration, server-side rules, database records, or original development history.

The account loader observes the existing Firebase loading state. It waits 180 ms before displaying the themed basketball animation and closes on completion or error.
