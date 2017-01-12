Imports System.Web
Imports System.Web.Services
Imports System.Web.Script.Serialization

Public Class plugin1
    Implements System.Web.IHttpHandler

    Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest

        Dim db As New mbpDataContext

        Dim pid = context.Request.QueryString("id")
        Dim plugin = db.plugins.SingleOrDefault(Function(p) p.id = pid)

        Dim json As New JavaScriptSerializer()

        context.Response.Write(json.Serialize(plugin))

    End Sub

    ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

End Class