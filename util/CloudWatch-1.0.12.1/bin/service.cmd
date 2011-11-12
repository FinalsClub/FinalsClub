@echo off

setlocal

REM Set intermediate env vars because the %VAR:x=y% notation below
REM (which replaces the string x with the string y in VAR)
REM doesn't handle undefined environment variables. This way
REM we're always dealing with defined variables in those tests.
set CHK_JAVA_HOME=_%JAVA_HOME%
set CHK_SERVICE_HOME=_%SERVICE_HOME%
set CHK_CREDENTIAL_FILE=_%AWS_CREDENTIAL_FILE%

if "%CHK_CREDENTIAL_FILE:"=%" == "_" goto CREDENTIAL_FILE_MISSING
SET AWS_CREDENTIAL_FILE=%AWS_CREDENTIAL_FILE:"=%
:CREDENTIAL_FILE_MISSING

if "%CHK_SERVICE_HOME:"=%" == "_" goto SERVICE_HOME_MISSING
if "%CHK_JAVA_HOME:"=%" == "_" goto JAVA_HOME_MISSING 

REM If a classpath exists preserve it

SET SERVICE_HOME=%SERVICE_HOME:"=%
SET LIB="%SERVICE_HOME%\lib"

REM Brute force
SET CP=%LIB%\service.jar
SET CP=%CP%;%LIB%\CliCommando-1.0.jar
SET CP=%CP%;%LIB%\Commons-codec-1.3.jar
SET CP=%CP%;%LIB%\Commons-cli-1.1.jar
SET CP=%CP%;%LIB%\activation-1.1.jar
SET CP=%CP%;%LIB%\CliCommando-1.0.jar
SET CP=%CP%;%LIB%\commons-discovery-0.2.jar
SET CP=%CP%;%LIB%\commons-httpclient-3.0.jar
SET CP=%CP%;%LIB%\commons-logging-1.0.4.jar
SET CP=%CP%;%LIB%\commons-logging-api-1.1.1.jar
SET CP=%CP%;%LIB%\service.jar
SET CP=%CP%;%LIB%\jaxb-api-2.0.jar
SET CP=%CP%;%LIB%\jaxb-impl-2.0.1.jar
SET CP=%CP%;%LIB%\jaxws-api-2.0.jar
SET CP=%CP%;%LIB%\jdom-1.0.jar
SET CP=%CP%;%LIB%\log4j.jar
SET CP=%CP%;%LIB%\serializer.jar
SET CP=%CP%;%LIB%\stax-api-1.0.1.jar
SET CP=%CP%;%LIB%\wsdl4j-1.6.1.jar
SET CP=%CP%;%LIB%\wss4j-1.5.7.jar
SET CP=%CP%;%LIB%\wstx-asl-3.2.0.jar
SET CP=%CP%;%LIB%\xalan-j2-2.7.0.jar
SET CP=%CP%;%LIB%\xfire-all-1.2.6.jar
SET CP=%CP%;%LIB%\xfire-jsr181-api-1.0-M1.jar
SET CP=%CP%;%LIB%\xmlsec-1.4.2.jar


REM Grab the class name
SET CMD=%1

REM SHIFT doesn't affect %* so we need this clunky hack
SET ARGV=%2
SHIFT
SHIFT
:ARGV_LOOP
IF (%1) == () GOTO ARGV_DONE
REM Get around strange quoting bug
SET ARG=%1

REM Escape the minus sign for negative numbers
ECHO %ARG% > %TEMP%\argtest
FINDSTR /B \-[0-9.] %TEMP%\argtest > NUL
if %ERRORLEVEL%==0 (
    SET ARG=\%ARG%
)
DEL %TEMP%\argtest


SET ARG=%ARG:"=%
SET ARGV=%ARGV% "%ARG%"
SHIFT
GOTO ARGV_LOOP
:ARGV_DONE

REM Make sure JAVA_HOME has only a single sorrounding double quotes
set JAVA_HOME="%JAVA_HOME:"=%"

REM run
%JAVA_HOME%\bin\java %SERVICE_JVM_ARGS% -classpath %CP% com.amazon.webservices.Cli %CMD% %ARGV%
goto DONE

:JAVA_HOME_MISSING
echo JAVA_HOME is not set
exit /b 1

:SERVICE_HOME_MISSING
echo "This command is not intended to be run directly. Please see documentation on using service commands."
exit /b 1

:DONE
endlocal
