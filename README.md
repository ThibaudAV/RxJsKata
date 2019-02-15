# RxJsKata

The aim of this kata is to have a grasp on concepts and tools that are mandatory working on a real life RX applications.  
It is highly recommended to have gone through the excellent [RxJs Koans](https://github.com/Reactive-Extensions/RxJSKoans/) before doing this kata. Speaking ow which, technical pre requisites, installation process for this kata are the same than the ones for RxJs Koans.

Doing this kata you might learn things on:

1. the different types of observables, hot and cold
2. test schedulers and time virtualisation
3. putting all together with exercices involving several Rx operators

As with RxJs koans, the kata begins with simple exercices with "\_\_" placeholders. These exercices should give you understanding on hot/cold concepts and get you familiar with test scheduler.  
The second part of this kata is made of 3 more complex exercices. On these exercices, a chunk of code, transforming Rx streams, need to be written in order to get existing unit tests running successfully.

## Note about Qunit

Qunit assertions are used on all exercices. Most of us are used to write first in an assertion the expected value and then the actual value. This is actually what has been done on this kata. Sadly Qunit works the other way around and hence when tests fail you get misleading error messages where actual means expected and...
