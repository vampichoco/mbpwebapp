Imports System.Web
Imports System.Web.Services
Imports System.Web.Script.Serialization

Public Class impuestos
    Implements System.Web.IHttpHandler

    Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest



        Dim db As New mbpDataContext

        Dim imps = db.impuestos.ToList()

        Dim json As New JavaScriptSerializer()
        context.Response.Write(json.Serialize(imps))


    End Sub

    ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

End Class