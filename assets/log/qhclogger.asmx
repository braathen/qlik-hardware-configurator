<%@ WebService language = "C#" class = "QHCLogger" %>

using System;
using System.Web.Services;
using System.Xml.Serialization;

[WebService(Namespace="http://localhost/QHC/")]
public class QHCLogger : WebService
{
   [WebMethod]
   public bool Log(string userid, string url)
   {
	try {
		using (System.IO.StreamWriter file = new System.IO.StreamWriter(@"C:\websites\qlik-hardware-configurator\assets\log\logfile.txt", true))
        	{
            		file.WriteLine(DateTime.Now + "," + userid + "," + url);
	        }
	      	return true;
	}
	catch {
		return false;
	}
   }
}
