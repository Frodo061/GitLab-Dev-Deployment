#! /bin/bash

pdflatex -shell-escape -jobname report *.tex  >/dev/null
pdflatex -shell-escape -jobname report *.tex  >/dev/null

rm -rf *.aux *.log *.out *.toc *.lof
rm -rf _minted*

echo "Done!"
echo