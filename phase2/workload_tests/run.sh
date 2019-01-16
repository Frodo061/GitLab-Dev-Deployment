#!/bin/bash

tests=( 'download_stress_test' 'login_stress_test' )

usage() { echo "Usage: $0 [-o output_name]" 1>&2; exit 1; }

while getopts ":o:" output_name; do
    case "${output_name}" in
        o)
            o=${OPTARG}
            ;;
        *)
            o=results
            ;;
    esac
done
shift $((OPTIND-1))

for test in ${tests[@]}
do
    cd $test
    echo "Runing $(pwd)"
    echo "Results in $test/$o"
    jmeter -n -t test.jmx -l "$o.jtl" -e -o $o
    cd ..
done
